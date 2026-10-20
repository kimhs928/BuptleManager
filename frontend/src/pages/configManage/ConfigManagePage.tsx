import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { BuildingIcon, CloseIcon, EditIcon, EyeIcon, InfoIcon, LockIcon, PlusIcon, SearchIcon, TenantIcon, TrashIcon, WorldIcon } from '../../components/icons'
import { CompanyShell } from '../../components/layout/CompanyShell'
import { Button, Card, EmptyState, Select, TextInput } from '../../components/ui'
import { cn } from '../../lib/cn'
import { MOCK_CONFIG_SYNCED_AT, MOCK_CONFIGS, MOCK_PUBLIC_CONFIGS } from '../../mocks/companyDetail'
import { HISTORY_CURRENT_CUSTOMER, HISTORY_CUSTOMERS } from '../../mocks/history'
import { texts } from '../../texts'
import { ConfigValueModal } from '../company/ConfigValueModal'
import { CustomerPicker } from '../history/CustomerPicker'
import type { ConfigDetail } from '../company/ConfigValueModal'
import { ConfigDeleteModal } from './ConfigDeleteModal'
import { ConfigFormModal } from './ConfigFormModal'
import type { ManagedRow, ManagedScope } from './types'

const t = texts.configManage

/** 입력한 조건을 결합하는 방식. or: 하나라도 일치, and: 모두 일치 */
type Mode = 'or' | 'and'

/** 고객사는 범위를 정하는 조건이라 결합 방식과 상관없이 항상 적용한다 */
type Condition = { customer: string; type: '' | ManagedScope; name: string; description: string; user: string; from: string; to: string; mode: Mode }

const blank: Condition = { customer: '', type: '', name: '', description: '', user: '', from: '', to: '', mode: 'or' }

function Labeled({ label, hint, htmlFor, children, className }: { label: string; hint?: string; htmlFor?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="inline-flex items-baseline gap-1.5 text-xs font-medium text-ink-3">
        {label}
        {hint && <span className="text-[11px] font-normal text-ink-4">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

const TENANT_SCOPES: ManagedScope[] = ['COMPONENT', 'MODULES', 'STANDALONE']
/** 값을 가지는 컨피그 타입 */
const HAS_VALUE: Record<ManagedScope, boolean> = { COMPONENT: false, MODULES: false, STANDALONE: true, PUBLIC: false }

const scopeTone: Record<ManagedScope, string> = {
  COMPONENT: 'bg-[#f0effd] text-[#4b49c8]',
  MODULES: 'bg-[#f2f2f5] text-ink',
  STANDALONE: 'bg-[#f2f2f5] text-ink-3',
  PUBLIC: 'border border-[#fbe08a] bg-[#fff1d6] text-[#7a5800]',
}

const pill = 'inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold'
const th = 'whitespace-nowrap px-4 py-2.5 text-left text-[11px] font-semibold tracking-wide text-ink-4'
const td = 'px-4 py-2.5 align-middle text-[13px]'
const viewBtn = 'inline-flex h-6 shrink-0 items-center gap-1 rounded-[7px] border border-line-strong bg-surface px-2 text-[11.5px] font-medium text-ink hover:bg-hover'

/** 처음에 채워 둘 컨피그. 고객사마다 일부씩 다르게 적용되어 있다고 가정한다 */
function seedRows(): ManagedRow[] {
  const tenant = HISTORY_CUSTOMERS.flatMap((c, i) =>
    (c.id === HISTORY_CURRENT_CUSTOMER.id ? MOCK_CONFIGS : MOCK_CONFIGS.slice(i, i + 4 + (i % 4))).map((r) => ({ ...r, id: `${c.id}-${r.id}`, customerId: c.id })),
  )
  const common = MOCK_PUBLIC_CONFIGS.map((r) => ({ ...r, scope: 'PUBLIC' as const, value: '', customerId: '' }))
  return [...common, ...tenant]
}

/** 고객사를 제외한 조건을 OR(하나라도 일치) 또는 AND(모두 일치)로 결합해 판단한다 */
function matches(r: ManagedRow, c: Condition): boolean {
  const name = c.name.trim().toLowerCase()
  const description = c.description.trim().toLowerCase()
  if (!c.type && !name && !description && !c.user && !c.from && !c.to) return true
  const tests: boolean[] = []
  if (c.type) tests.push(r.scope === c.type)
  if (name) tests.push(r.name.toLowerCase().includes(name))
  if (description) tests.push(r.description.toLowerCase().includes(description))
  if (c.user) tests.push(r.appliedBy === c.user)
  if (c.from || c.to) tests.push((!c.from || r.appliedAt >= c.from) && (!c.to || r.appliedAt <= c.to))
  return c.mode === 'and' ? tests.every(Boolean) : tests.some(Boolean)
}

function GroupRow({ variant, label, count, span }: { variant: 'public' | 'tenant'; label: string; count: number; span: number }) {
  const isPublic = variant === 'public'
  return (
    <tr className={isPublic ? 'border-t border-[#fbe08a] bg-[#fff7db]' : 'border-t-2 border-divider bg-[#fafafb]'}>
      <td colSpan={span} className="px-5 py-[9px]">
        <span className={cn('inline-flex items-center gap-2 text-xs', isPublic ? 'text-[#7a5800]' : 'text-ink-2')}>
          {isPublic ? <WorldIcon size={14} /> : <TenantIcon size={14} />}
          <span className="font-semibold">{label}</span>
          <span className={isPublic ? 'text-[#b07a2a]' : 'text-ink-4'}>{t.list.groupCount(count)}</span>
        </span>
      </td>
    </tr>
  )
}

type Props = {
  /** 고객사를 고르지 않고 들어온 화면. 모든 고객사의 컨피그를 보여 주고 검색 조건에서 고객사를 고른다 */
  global?: boolean
}

/** 컨피그 관리 (등록 · 수정 · 삭제) */
export function ConfigManagePage({ global = false }: Props) {
  const current = HISTORY_CURRENT_CUSTOMER
  const [rows, setRows] = useState<ManagedRow[]>(seedRows)
  const [draft, setDraft] = useState<Condition>(blank)
  const [applied, setApplied] = useState<Condition>(blank)
  const [form, setForm] = useState<{ row?: ManagedRow } | null>(null)
  const [removing, setRemoving] = useState<ManagedRow | null>(null)
  const [viewing, setViewing] = useState<ConfigDetail | null>(null)
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState('')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copyDetail = async ({ field, row }: ConfigDetail) => {
    try {
      await navigator.clipboard.writeText(field === 'value' && 'value' in row ? row.value : row.description)
    } catch {
      // 클립보드 권한이 없으면 복사됨 표시를 하지 않는다
      return
    }
    setCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 1600)
  }

  // 고객사를 선택한 상태면 그 고객사로 거르고, 선택하지 않은 상태면 모든 고객사를 보여 준다
  const scopeCustomer = global ? applied.customer : current.id
  const customerName = (id: string) => HISTORY_CUSTOMERS.find((c) => c.id === id)?.name ?? '-'
  const companyLabel = (r: ManagedRow) => {
    if (r.scope === 'PUBLIC') return t.scope.publicCompany
    const c = HISTORY_CUSTOMERS.find((x) => x.id === r.customerId)
    return c ? `${c.name} · ${c.code}` : '-'
  }

  const invalid = draft.from !== '' && draft.to !== '' && draft.from > draft.to
  const users = [...new Set(rows.map((r) => r.appliedBy))]
  const tenantRows = rows.filter((r) => r.scope !== 'PUBLIC' && (!scopeCustomer || r.customerId === scopeCustomer) && matches(r, applied))
  const publicRows = rows.filter((r) => r.scope === 'PUBLIC' && matches(r, applied))
  const shown = tenantRows.length + publicRows.length
  const span = global ? 8 : 7

  const setField = (key: Exclude<keyof Condition, 'mode'>) => (value: string) => setDraft((d) => ({ ...d, [key]: value }))
  const search = () => {
    if (!invalid) setApplied({ ...draft })
  }
  const reset = () => {
    // 결합 방식은 초기화해도 유지한다
    setDraft((d) => ({ ...blank, mode: d.mode }))
    setApplied((a) => ({ ...blank, mode: a.mode }))
  }

  // 고객사를 선택한 상태에서는 PUBLIC을 읽기 전용으로 둔다 (모든 고객사에 영향을 주기 때문)
  const publicEditable = global

  const rowActions = (r: ManagedRow) => (
    <span className="inline-flex items-center gap-1.5">
      <button
        type="button"
        aria-label={`${r.name} ${t.list.edit}`}
        title={t.list.edit}
        onClick={() => setForm({ row: r })}
        className="inline-flex size-[30px] items-center justify-center rounded-ctl bg-primary text-white hover:brightness-105"
      >
        <EditIcon size={14} />
      </button>
      <button
        type="button"
        aria-label={`${r.name} ${t.list.remove}`}
        title={t.list.remove}
        onClick={() => setRemoving(r)}
        className="inline-flex size-[30px] items-center justify-center rounded-ctl border border-danger-line bg-surface text-danger-ink hover:bg-danger-soft"
      >
        <TrashIcon size={14} />
      </button>
    </span>
  )

  return (
    <CompanyShell active="config" noCompany={global} trail={[{ label: t.breadcrumb.page }]}>
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5">
        {toast && (
          <div role="status" className="flex items-center gap-3 rounded-xl border border-success-line bg-success-soft px-3.5 py-[11px] text-[13px] text-success-ink">
            <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-success" />
            <span className="flex-1 leading-[1.45]">{toast}</span>
            <button type="button" aria-label={t.toast.close} onClick={() => setToast('')} className="inline-flex size-6 items-center justify-center rounded-md hover:bg-success-line/60">
              <CloseIcon size={13} />
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="m-0 text-[26px] font-bold tracking-[-0.02em]">{t.title}</h1>
          <Button icon={<PlusIcon size={14} strokeWidth={2.4} />} onClick={() => setForm({})} className="h-9 rounded-ctl px-[18px] font-semibold">
            {t.toolbar.add}
          </Button>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl border border-line-strong bg-[#f2f2f5] px-3.5 py-3 text-[13px] leading-normal">
          <InfoIcon size={15} className="mt-0.5 shrink-0 text-ink-3" />
          <span>{t.notice}</span>
        </div>

        <section aria-label={t.search.title} className="flex flex-col gap-3.5 rounded-card border border-line bg-surface px-5 pb-5 pt-[18px] shadow-card">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-ink-4">{t.search.title}</span>
            <div role="radiogroup" aria-label={t.search.modeLabel} className="inline-flex items-center gap-4">
              {(
                [
                  ['or', t.search.modeOr],
                  ['and', t.search.modeAnd],
                ] as const
              ).map(([value, label]) => (
                <label key={value} className="inline-flex cursor-pointer select-none items-center gap-1.5 text-[12.5px] text-ink">
                  <input type="radio" name="config-mode" value={value} checked={draft.mode === value} onChange={() => setDraft((d) => ({ ...d, mode: value }))} className="m-0 size-[15px] accent-primary" />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <form
            className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4"
            onSubmit={(e) => {
              e.preventDefault()
              search()
            }}
          >
            {global ? (
              <Labeled label={t.search.customer} htmlFor="cm-customer">
                <CustomerPicker value={draft.customer} onPick={setField('customer')} countOf={(id) => rows.filter((r) => r.customerId === id).length} />
              </Labeled>
            ) : (
              <Labeled label={t.search.customer} hint={t.search.customerFixed}>
                <div className="flex h-[38px] items-center gap-2 rounded-ctl border border-line-strong/40 bg-[#ececf0] px-3 text-[13px] text-ink-3">
                  <BuildingIcon size={14} className="shrink-0 text-ink-4" />
                  <span className="truncate font-medium">{current.name}</span>
                  <span className="font-mono text-[11.5px] text-ink-4">{current.code}</span>
                </div>
              </Labeled>
            )}
            <Labeled label={t.search.type} htmlFor="cm-type">
              <Select id="cm-type" value={draft.type} onChange={(e) => setField('type')(e.target.value)}>
                <option value="">{t.search.all}</option>
                {[...TENANT_SCOPES, 'PUBLIC' as const].map((s) => (
                  <option key={s} value={s}>
                    {t.list.typeLabel[s]}
                  </option>
                ))}
              </Select>
            </Labeled>
            <Labeled label={t.search.name} htmlFor="cm-name">
              <TextInput id="cm-name" autoComplete="off" placeholder={t.search.namePlaceholder} value={draft.name} onChange={(e) => setField('name')(e.target.value)} className="font-mono" />
            </Labeled>
            <Labeled label={t.search.description} htmlFor="cm-desc">
              <TextInput id="cm-desc" autoComplete="off" placeholder={t.search.descriptionPlaceholder} value={draft.description} onChange={(e) => setField('description')(e.target.value)} />
            </Labeled>
            <Labeled label={t.search.user} htmlFor="cm-user">
              <Select id="cm-user" value={draft.user} onChange={(e) => setField('user')(e.target.value)}>
                <option value="">{t.search.all}</option>
                {users.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
            </Labeled>
            <Labeled label={t.search.from} htmlFor="cm-from">
              <TextInput id="cm-from" type="date" value={draft.from} onChange={(e) => setField('from')(e.target.value)} />
            </Labeled>
            <Labeled label={t.search.to} htmlFor="cm-to">
              <TextInput id="cm-to" type="date" value={draft.to} onChange={(e) => setField('to')(e.target.value)} />
            </Labeled>
            <div className="flex items-end gap-2">
              <Button type="button" variant="secondary" onClick={reset} className="h-[38px] rounded-ctl px-3.5 font-medium">
                {t.search.reset}
              </Button>
              <Button type="submit" variant="dark" icon={<SearchIcon size={14} strokeWidth={2.4} />} disabled={invalid} className="h-[38px] flex-1 rounded-[10px] px-[18px] text-[13.5px] font-semibold">
                {t.search.submit}
              </Button>
            </div>
            {invalid && (
              <div role="alert" className="rounded-[10px] border border-danger-line bg-danger-soft px-3 py-2 text-xs text-danger-ink sm:col-span-2 lg:col-span-4">
                {t.search.invalidRange}
              </div>
            )}
          </form>
        </section>

        <section aria-labelledby="config-manage-list" className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-3">
            <h2 id="config-manage-list" className="m-0 text-[13px] font-semibold">
              {t.list.title}
            </h2>
            <span className="text-xs text-ink-4">{t.list.count(shown, MOCK_CONFIG_SYNCED_AT)}</span>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className={cn('w-full border-collapse', global ? 'min-w-[1240px]' : 'min-w-[1080px]')}>
                <thead>
                  <tr className="border-b border-line-soft bg-[#fafafb]">
                    <th scope="col" className={th}>{t.list.columns.type}</th>
                    {global && <th scope="col" className={th}>{t.list.columns.customer}</th>}
                    <th scope="col" className={th}>{t.list.columns.name}</th>
                    <th scope="col" className={th}>{t.list.columns.value}</th>
                    <th scope="col" className={th}>{t.list.columns.description}</th>
                    <th scope="col" className={th}>{t.list.columns.appliedAt}</th>
                    <th scope="col" className={th}>{t.list.columns.appliedBy}</th>
                    <th scope="col" className={cn(th, 'pr-5 text-right')}>{t.list.columns.action}</th>
                  </tr>
                </thead>
                <tbody>
                  {publicRows.length > 0 && (
                    <>
                      <GroupRow variant="public" label={t.list.publicGroup} count={publicRows.length} span={span} />
                      {publicRows.map((r) => (
                        <tr key={r.id} className="border-t border-[#fbefd6] bg-[#fffcf5]">
                          <td className={td}>
                            <span className={cn(pill, scopeTone.PUBLIC)}>PUBLIC</span>
                          </td>
                          {global && <td className={cn(td, 'text-ink-4')}>{t.list.allCustomers}</td>}
                          <td className={td}>
                            <code className="rounded-md bg-[#fbf1dd] px-[7px] py-0.5 font-mono text-xs text-ink">{r.name}</code>
                          </td>
                          <td className={cn(td, 'text-[#c7c7cc]')}>{t.list.noValue}</td>
                          <td className={cn(td, 'text-ink-2')}>
                            <span className="flex items-center gap-2">
                              <span className="max-w-[260px] truncate">{r.description}</span>
                              <button type="button" onClick={() => setViewing({ field: 'description', row: r })} aria-label={`${r.name} ${t.list.viewDetail}`} className={viewBtn}>
                                <EyeIcon size={12} />
                                {t.list.viewDetail}
                              </button>
                            </span>
                          </td>
                          <td className={cn(td, 'whitespace-nowrap tabular-nums text-ink-3')}>{r.appliedAt}</td>
                          <td className={cn(td, 'text-ink-3')}>{r.appliedBy}</td>
                          <td className={cn(td, 'pr-5 text-right')}>
                            {publicEditable ? (
                              rowActions(r)
                            ) : (
                              <span className="inline-flex items-center gap-[5px] text-xs text-ink-4">
                                <LockIcon size={12} />
                                {t.list.readOnly}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                  {publicRows.length > 0 && tenantRows.length > 0 && <GroupRow variant="tenant" label={t.list.tenantGroup} count={tenantRows.length} span={span} />}
                  {tenantRows.map((r) => (
                    <tr key={r.id} className="border-t border-line-soft hover:bg-hover">
                      <td className={td}>
                        <span className={cn(pill, scopeTone[r.scope])}>{t.list.typeLabel[r.scope]}</span>
                      </td>
                      {global && <td className={cn(td, 'whitespace-nowrap text-ink-2')}>{customerName(r.customerId)}</td>}
                      <td className={td}>
                        <code className="rounded-md bg-[#f2f2f5] px-[7px] py-0.5 font-mono text-xs text-ink">{r.name}</code>
                      </td>
                      <td className={td}>
                        {!HAS_VALUE[r.scope] || r.value === '' ? (
                          <span className="text-[#c7c7cc]">{t.list.noValue}</span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <span className="max-w-[160px] truncate font-mono text-xs">{r.value.replace(/\s+/g, ' ')}</span>
                            <button type="button" onClick={() => setViewing({ field: 'value', row: { ...r, scope: r.scope as 'STANDALONE' } })} aria-label={`${r.name} ${t.list.viewDetail}`} className={viewBtn}>
                              <EyeIcon size={12} />
                              {t.list.viewDetail}
                            </button>
                          </span>
                        )}
                      </td>
                      <td className={cn(td, 'text-ink-2')}>
                        <span className="flex items-center gap-2">
                          <span className="max-w-[260px] truncate">{r.description}</span>
                          <button type="button" onClick={() => setViewing({ field: 'description', row: { ...r, scope: r.scope as 'STANDALONE' } })} aria-label={`${r.name} ${t.list.viewDetail}`} className={viewBtn}>
                            <EyeIcon size={12} />
                            {t.list.viewDetail}
                          </button>
                        </span>
                      </td>
                      <td className={cn(td, 'whitespace-nowrap tabular-nums text-ink-3')}>{r.appliedAt}</td>
                      <td className={cn(td, 'text-ink-3')}>{r.appliedBy}</td>
                      <td className={cn(td, 'pr-5 text-right')}>{rowActions(r)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {shown === 0 && <EmptyState title={t.list.emptyTitle} description={t.list.emptyDescription} />}
            </div>
          </Card>
        </section>
      </div>

      {form && (
        <ConfigFormModal
          row={form.row}
          existing={rows}
          scopes={global ? [...TENANT_SCOPES, 'PUBLIC'] : TENANT_SCOPES}
          customers={HISTORY_CUSTOMERS}
          fixedCustomerId={global ? undefined : current.id}
          defaultCustomerId={global ? applied.customer : undefined}
          onClose={() => setForm(null)}
          onSave={(next, count, ticket) => {
            const edited = !!form.row
            setRows((prev) => (edited ? prev.map((r) => (r.id === next.id ? next : r)) : [...prev, next]))
            setToast(edited ? t.toast.edited(next.name, count, ticket) : t.toast.added(next.name, ticket))
            setForm(null)
          }}
        />
      )}
      {removing && (
        <ConfigDeleteModal
          row={removing}
          companyLabel={companyLabel(removing)}
          onClose={() => setRemoving(null)}
          onSave={(ticket) => {
            setRows((prev) => prev.filter((r) => r.id !== removing.id))
            setToast(t.toast.removed(removing.name, ticket))
            setRemoving(null)
          }}
        />
      )}
      {viewing && <ConfigValueModal detail={viewing} copied={copied} onCopy={() => void copyDetail(viewing)} onClose={() => setViewing(null)} />}
    </CompanyShell>
  )
}
