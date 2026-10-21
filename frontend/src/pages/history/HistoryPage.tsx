import { useState } from 'react'
import type { ReactNode } from 'react'
import { BuildingIcon, ChevronRightIcon, InfoIcon, SearchIcon } from '../../components/icons'
import { CompanyShell } from '../../components/layout/CompanyShell'
import { Button, Card, EmptyState, Select, TextInput } from '../../components/ui'
import { cn } from '../../lib/cn'
import { HISTORY_CURRENT_CUSTOMER, HISTORY_CUSTOMERS, HISTORY_FUNCS, HISTORY_USERS, MOCK_HISTORY_RECORDS } from '../../mocks/history'
import type { HistoryRecord } from '../../mocks/history'
import { texts } from '../../texts'
import { HistoryDetailModal } from './HistoryDetailModal'
import { CustomerPicker } from './CustomerPicker'
import { FuncChip, TypeChip } from './shared'

const t = texts.history

const PAGE_SIZE = 10
/** 고객사를 고르지 않았을 때 보여 주는 최신 내역 수 */
const ALL_LIMIT = 50

/** 입력한 조건을 결합하는 방식. or: 하나라도 일치, and: 모두 일치 */
type Mode = 'or' | 'and'

/** docId는 다른 화면에서 문서 하나의 내역만 보려고 넘긴 범위 조건이다. 결합 방식과 상관없이 항상 적용한다 */
type Condition = { ticket: string; user: string; func: string; target: string; docId: string; from: string; to: string; mode: Mode }

const blank: Condition = { ticket: '', user: '', func: '', target: '', docId: '', from: '', to: '', mode: 'or' }

/** 다른 화면에서 넘어온 검색 조건(주소의 func, docId, target, ticket, user, from, to, mode)을 읽는다 */
function conditionFromUrl(): Condition {
  const p = new URLSearchParams(window.location.search)
  const func = p.get('func') ?? ''
  const user = p.get('user') ?? ''
  return {
    ticket: p.get('ticket') ?? '',
    user: HISTORY_USERS.includes(user) ? user : '',
    func: HISTORY_FUNCS.includes(func as (typeof HISTORY_FUNCS)[number]) ? func : '',
    target: p.get('target') ?? '',
    docId: p.get('docId') ?? '',
    from: p.get('from') ?? '',
    to: p.get('to') ?? '',
    mode: p.get('mode') === 'and' ? 'and' : 'or',
  }
}

/** 입력한 조건을 OR(하나라도 일치) 또는 AND(모두 일치)로 결합해 조회한다 */
function matches(r: HistoryRecord, c: Condition): boolean {
  if (c.docId && r.docId !== c.docId) return false
  const ticket = c.ticket.trim().toLowerCase()
  const target = c.target.trim().toLowerCase()
  if (!ticket && !c.user && !c.func && !target && !c.from && !c.to) return true
  const day = r.at.slice(0, 10)
  const tests: boolean[] = []
  if (ticket !== '') tests.push(r.ticket.toLowerCase().includes(ticket))
  if (c.user !== '') tests.push(r.user === c.user)
  if (c.func !== '') tests.push(r.func === c.func)
  if (target !== '') tests.push(r.target.toLowerCase().includes(target))
  if (c.from !== '' || c.to !== '') tests.push((!c.from || day >= c.from) && (!c.to || day <= c.to))
  return c.mode === 'and' ? tests.every(Boolean) : tests.some(Boolean)
}

function Labeled({ label, htmlFor, hint, children, className }: { label: ReactNode; htmlFor?: string; hint?: string; children: ReactNode; className?: string }) {
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

const th = 'whitespace-nowrap border-b border-line-soft px-3.5 py-2.5 text-left text-xs font-medium text-ink-4'
const td = 'px-3.5 py-3 align-middle'
const navBtn = 'inline-flex size-[30px] items-center justify-center rounded-ctl border border-line-strong bg-surface p-0 text-base text-ink-2 disabled:cursor-not-allowed disabled:text-[#c7c7cc]'

/** 처리 내역 히스토리. 기본은 선택한 고객사의 내역, `?history&all`은 고객사를 고르지 않은 화면 */
export function HistoryPage() {
  const allMode = new URLSearchParams(window.location.search).has('all')
  const current = HISTORY_CURRENT_CUSTOMER

  const [pick, setPick] = useState('')
  const [draft, setDraft] = useState<Condition>(conditionFromUrl)
  const [applied, setApplied] = useState<Condition>(conditionFromUrl)
  const [page, setPage] = useState(1)
  const [openId, setOpenId] = useState<number | null>(null)

  const scope = allMode ? pick : current.id
  const scopeCustomer = HISTORY_CUSTOMERS.find((c) => c.id === scope)
  const hasCondition = [applied.ticket, applied.user, applied.func, applied.target, applied.docId, applied.from, applied.to].some((v) => v.trim() !== '')
  const invalid = draft.from !== '' && draft.to !== '' && draft.from > draft.to

  const found = MOCK_HISTORY_RECORDS.filter((r) => (!scope || r.customerId === scope) && matches(r, applied))
  const list = scope ? found : found.slice(0, ALL_LIMIT)
  const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const rows = list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const showCustomer = !scope
  const detail = openId === null ? null : (MOCK_HISTORY_RECORDS.find((r) => r.id === openId) ?? null)

  const summary = scope
    ? hasCondition
      ? t.result.summarySearch(list.length)
      : t.result.summaryTotal(list.length)
    : found.length > ALL_LIMIT
      ? hasCondition
        ? t.result.summaryLatestSearch(found.length)
        : t.result.summaryLatestAll(found.length)
      : t.result.summaryTotal(found.length)

  const subtitle = !allMode ? t.subtitle.customer(current.name, current.code) : scopeCustomer ? t.subtitle.picked(scopeCustomer.name) : t.subtitle.all

  const set = (key: Exclude<keyof Condition, 'mode'>) => (value: string) => setDraft((d) => ({ ...d, [key]: value }))
  const search = () => {
    if (invalid) return
    setApplied({ ...draft })
    setPage(1)
  }
  const reset = () => {
    // 결합 방식은 초기화해도 유지한다
    setDraft((d) => ({ ...blank, mode: d.mode }))
    setApplied((a) => ({ ...blank, mode: a.mode }))
    setPage(1)
  }
  const changePick = (id: string) => {
    setPick(id)
    setPage(1)
  }

  const from = Math.max(1, Math.min(currentPage - 2, pageCount - 4))
  const pageNumbers = Array.from({ length: Math.min(5, pageCount) }, (_, i) => from + i)

  return (
    <CompanyShell active="history" noCompany={allMode} trail={[{ label: t.breadcrumb.history }, { label: t.breadcrumb.page }]}>
      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 text-[26px] font-bold tracking-[-0.02em]">{t.title}</h1>
        <p className="m-0 text-sm text-ink-3">{subtitle}</p>
      </div>

      {allMode && !scope && (
        <div role="note" className="flex items-start gap-2.5 rounded-xl border border-line-strong bg-[#f2f2f5] px-3.5 py-3 text-[13px] leading-normal">
          <InfoIcon size={15} className="mt-0.5 shrink-0 text-ink-3" />
          <span>
            <b className="font-semibold">{t.banner.allBold}</b>
            {t.banner.allRest}
          </span>
        </div>
      )}
      {allMode && scope && scopeCustomer && (
        <div role="note" className="flex items-center gap-2.5 rounded-xl border border-line-strong bg-[#f2f2f5] px-3.5 py-2.5 text-[13px]">
          <InfoIcon size={15} className="shrink-0 text-ink-3" />
          <span className="flex-1">
            <b className="font-semibold">{t.banner.picked(scopeCustomer.name)}</b>
          </span>
          <button type="button" onClick={() => changePick('')} className="h-7 rounded-[7px] border border-line-strong bg-surface px-2.5 text-xs font-medium hover:bg-hover">
            {t.banner.clear}
          </button>
        </div>
      )}

      {applied.docId && (
        <div role="note" className="flex items-center gap-2.5 rounded-xl border border-line-strong bg-[#f2f2f5] px-3.5 py-2.5 text-[13px]">
          <InfoIcon size={15} className="shrink-0 text-ink-3" />
          <span className="flex-1">
            <b className="font-semibold">{t.banner.doc(applied.docId)}</b>
          </span>
          <button
            type="button"
            onClick={() => {
              setDraft((d) => ({ ...d, docId: '' }))
              setApplied((a) => ({ ...a, docId: '' }))
              setPage(1)
            }}
            className="h-7 rounded-[7px] border border-line-strong bg-surface px-2.5 text-xs font-medium hover:bg-hover"
          >
            {t.banner.docClear}
          </button>
        </div>
      )}

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
                <input type="radio" name="history-mode" value={value} checked={draft.mode === value} onChange={() => setDraft((d) => ({ ...d, mode: value }))} className="m-0 size-[15px] accent-primary" />
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
          {allMode ? (
            <Labeled label={t.search.customer}>
              <CustomerPicker value={pick} onPick={changePick} />
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
          <Labeled label={t.search.ticket} htmlFor="h-ticket">
            <TextInput id="h-ticket" placeholder={t.search.ticketPlaceholder} value={draft.ticket} onChange={(e) => set('ticket')(e.target.value)} />
          </Labeled>
          <Labeled label={t.search.user} htmlFor="h-user">
            <Select id="h-user" value={draft.user} onChange={(e) => set('user')(e.target.value)}>
              <option value="">{t.search.all}</option>
              {HISTORY_USERS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </Select>
          </Labeled>
          <Labeled label={t.search.func} htmlFor="h-func">
            <Select id="h-func" value={draft.func} onChange={(e) => set('func')(e.target.value)}>
              <option value="">{t.search.all}</option>
              {HISTORY_FUNCS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </Labeled>
          <Labeled label={t.search.target} htmlFor="h-target">
            <TextInput id="h-target" autoComplete="off" placeholder={t.search.targetPlaceholder} value={draft.target} onChange={(e) => set('target')(e.target.value)} />
          </Labeled>
          <Labeled label={t.search.from} htmlFor="h-from">
            <TextInput id="h-from" type="date" value={draft.from} onChange={(e) => set('from')(e.target.value)} />
          </Labeled>
          <Labeled label={t.search.to} htmlFor="h-to">
            <TextInput id="h-to" type="date" value={draft.to} onChange={(e) => set('to')(e.target.value)} />
          </Labeled>
          <div className="flex items-end gap-2 lg:col-start-4">
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

      <Card className="min-w-0 overflow-hidden">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line-soft px-5 py-3.5">
          <span className="flex items-baseline gap-2">
            <span className="text-[15px] font-semibold">{t.result.title}</span>
            <span className="text-[13px] text-ink-4" aria-live="polite">
              {summary}
            </span>
          </span>
          <span className="text-xs text-ink-4">{t.result.readOnly}</span>
        </div>

        {list.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table aria-label={t.result.tableLabel} className="w-full min-w-[1100px] border-collapse text-[13px]">
                <thead>
                  <tr>
                    <th scope="col" className={cn(th, 'pl-5')}>{t.result.columns.ticket}</th>
                    <th scope="col" className={th}>{t.result.columns.at}</th>
                    <th scope="col" className={th}>{t.result.columns.user}</th>
                    {showCustomer && <th scope="col" className={th}>{t.result.columns.customer}</th>}
                    <th scope="col" className={th}>{t.result.columns.func}</th>
                    <th scope="col" className={th}>{t.result.columns.type}</th>
                    <th scope="col" className={th}>{t.result.columns.target}</th>
                    <th scope="col" className={th}>{t.result.columns.change}</th>
                    <th scope="col" className={cn(th, 'pr-5')}>{t.result.columns.detail}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t border-line-soft bg-surface hover:bg-hover">
                      <td className={cn(td, 'whitespace-nowrap pl-5 font-mono text-[12.5px] text-ink-2')}>{r.ticket}</td>
                      <td className={cn(td, 'whitespace-nowrap tabular-nums text-ink-2')}>{r.at}</td>
                      <td className={cn(td, 'whitespace-nowrap')}>{r.user}</td>
                      {showCustomer && <td className={cn(td, 'whitespace-nowrap')}>{r.customerName}</td>}
                      <td className={td}>
                        <FuncChip label={r.func} />
                      </td>
                      <td className={td}>
                        <TypeChip type={r.type} />
                      </td>
                      <td className={cn(td, 'max-w-[220px] truncate text-ink-2')} title={r.target}>
                        {r.target}
                      </td>
                      <td className={cn(td, 'max-w-[260px]')}>
                        <span className="flex min-w-0 flex-col gap-0.5 text-xs leading-snug">
                          <span className="truncate text-ink-4" title={r.before}>
                            {t.result.before} · {r.before}
                          </span>
                          <span className="truncate font-medium" title={r.after}>
                            {t.result.after} · {r.after}
                          </span>
                        </span>
                      </td>
                      <td className={cn(td, 'whitespace-nowrap pr-5')}>
                        <button
                          type="button"
                          onClick={() => setOpenId(r.id)}
                          aria-label={`${r.ticket} ${t.result.viewDetail}`}
                          className="inline-flex h-7 items-center gap-1 rounded-ctl border border-line-strong bg-surface px-2.5 text-[12.5px] font-medium text-ink hover:bg-hover"
                        >
                          {t.result.viewDetail}
                          <ChevronRightIcon size={11} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-soft px-5 py-3">
              <span className="text-xs tabular-nums text-ink-4">{t.result.pageNote((currentPage - 1) * PAGE_SIZE + 1, Math.min(currentPage * PAGE_SIZE, list.length), pageCount)}</span>
              <nav aria-label={t.result.pagesLabel} className="flex items-center gap-1">
                <button type="button" aria-label={t.result.prevPage} disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} className={navBtn}>
                  ‹
                </button>
                {pageNumbers.map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-current={n === currentPage ? 'page' : undefined}
                    onClick={() => setPage(n)}
                    className={cn('h-[30px] min-w-[30px] rounded-ctl border-0 px-2 text-[13px] tabular-nums', n === currentPage ? 'bg-primary font-semibold text-white' : 'bg-transparent text-ink-2 hover:bg-hover')}
                  >
                    {n}
                  </button>
                ))}
                <button type="button" aria-label={t.result.nextPage} disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)} className={navBtn}>
                  ›
                </button>
              </nav>
            </div>
          </>
        ) : (
          <EmptyState
            title={t.result.emptyTitle}
            description={t.result.emptyDescription}
            action={
              <button type="button" onClick={reset} className="mt-1 h-8 rounded-ctl border border-line-strong bg-surface px-3.5 text-[13px] font-medium text-ink hover:bg-hover">
                {t.result.emptyAction}
              </button>
            }
          />
        )}
      </Card>

      {detail && <HistoryDetailModal key={detail.id} record={detail} onClose={() => setOpenId(null)} />}
    </CompanyShell>
  )
}
