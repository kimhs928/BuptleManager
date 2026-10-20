import { Fragment, useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronRightIcon, CloseIcon, DownloadIcon, EditIcon, SearchIcon, SwapIcon } from '../../components/icons'
import { CompanyShell } from '../../components/layout/CompanyShell'
import { Button, Select, TextInput } from '../../components/ui'
import { cn } from '../../lib/cn'
import { formatDateTime } from '../../lib/date'
import { MOCK_COMPANY_DETAIL } from '../../mocks/companyDetail'
import { MOCK_USERS, SYSTEM_ROLES } from '../../mocks/user'
import type { CompanyUser, DocKind } from '../../mocks/user'
import { texts } from '../../texts'
import { UserDocsDetail } from './UserDocsDetail'
import { UserEditModal } from './UserEditModal'
import { UserExportModal } from './UserExportModal'

const t = texts.user.list

type Filter = {
  pk: string
  name: string
  email: string
  role: string
  phone: string
  empNo: string
  dept: string
  title: string
  migrated: string
  loginFrom: string
  createdFrom: string
  joinFrom: string
  updatedFrom: string
  active: string
}

const blank: Filter = { pk: '', name: '', email: '', role: '', phone: '', empNo: '', dept: '', title: '', migrated: '', loginFrom: '', createdFrom: '', joinFrom: '', updatedFrom: '', active: '' }

const has = (value: string, query: string) => !query || value.toLowerCase().includes(query.trim().toLowerCase())

function matches(u: CompanyUser, f: Filter): boolean {
  if (!has(u.pk, f.pk) || !has(u.phone.replace(/-/g, ''), f.phone.replace(/-/g, '')) || !has(u.name, f.name) || !has(u.email, f.email)) return false
  if (!has(u.empNo, f.empNo) || !has(u.title, f.title) || !has(u.dept, f.dept)) return false
  if (f.role && !u.roles.some((r) => r === f.role)) return false
  if (f.active && String(u.active) !== f.active) return false
  if (f.migrated && String(u.migrated) !== f.migrated) return false
  if (f.loginFrom && u.lastLogin.slice(0, 10) < f.loginFrom) return false
  if (f.createdFrom && u.createdAt.slice(0, 10) < f.createdFrom) return false
  if (f.joinFrom && u.joinedAt.slice(0, 10) < f.joinFrom) return false
  if (f.updatedFrom && u.updatedAt.slice(0, 10) < f.updatedFrom) return false
  return true
}

function Labeled({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="text-xs font-medium text-ink-3">{label}</label>
      {children}
    </div>
  )
}

const th = 'whitespace-nowrap border-b border-line-soft px-3.5 py-2.5 text-left text-xs font-medium text-ink-4'
const td = 'whitespace-nowrap px-3.5 py-3 align-top'

/** 유저 관리 (검색 · 조회 · 수정 · 엑셀 추출) */
export function UserListPage() {
  const [users, setUsers] = useState<CompanyUser[]>(MOCK_USERS)
  const [draft, setDraft] = useState<Filter>(blank)
  const [applied, setApplied] = useState<Filter>(blank)
  const [open, setOpen] = useState<Record<string, DocKind | ''>>({})
  const [pages, setPages] = useState<Record<string, number>>({})
  const [editing, setEditing] = useState<CompanyUser | null>(null)
  const [exporting, setExporting] = useState(false)
  const [toast, setToast] = useState('')

  const rows = users.filter((u) => matches(u, applied))
  const set = (k: keyof Filter) => (e: { target: { value: string } }) => setDraft((d) => ({ ...d, [k]: e.target.value }))
  const input = (k: keyof Filter, props?: { type?: string }) => <TextInput className="h-9" type={props?.type} value={draft[k]} onChange={set(k)} />

  const labels: Record<keyof Filter, string> = {
    pk: t.fields.pk,
    name: t.fields.name,
    email: t.fields.email,
    role: t.fields.role,
    phone: t.fields.phone,
    empNo: t.fields.empNo,
    dept: t.fields.dept,
    title: t.fields.title,
    migrated: texts.user.list.columns.migrated,
    loginFrom: `${t.fields.loginFrom}`,
    createdFrom: `${t.fields.createdFrom}(이후)`,
    joinFrom: `${t.fields.joinFrom}(이후)`,
    updatedFrom: `${t.fields.updatedFrom}(이후)`,
    active: t.fields.active,
  }
  const shown = (k: keyof Filter, v: string) => (k === 'active' ? (v === 'true' ? t.activeYes : t.activeNo) : k === 'migrated' ? (v === 'true' ? t.migratedYes : t.migratedNo) : v)
  const conditions = (Object.keys(labels) as (keyof Filter)[]).filter((k) => applied[k]).map((k) => ({ label: labels[k], value: shown(k, applied[k]) }))

  const nowText = formatDateTime()

  return (
    <CompanyShell active="user" trail={[{ label: texts.user.breadcrumb.features }, { label: texts.user.breadcrumb.user }]}>
      {toast && (
        <div role="status" className="flex items-center gap-3 rounded-xl border border-success-line bg-success-soft py-[11px] pl-4 pr-3.5 text-[13px] text-success-ink">
          <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-success" />
          <span className="flex-1 leading-[1.45]">{toast}</span>
          <button type="button" aria-label={texts.user.toast.close} onClick={() => setToast('')} className="inline-flex size-[26px] items-center justify-center rounded-md hover:bg-success-line/60">
            <CloseIcon size={14} />
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 text-[26px] font-bold tracking-[-0.02em]">{t.title}</h1>
          <p className="m-0 text-sm text-ink-3">{t.description(MOCK_COMPANY_DETAIL.name)}</p>
        </div>
        <a href="?user=transfer" className="inline-flex h-[34px] items-center gap-[7px] rounded-ctl border border-line-strong bg-surface px-3.5 text-[13px] font-medium text-ink hover:bg-hover">
          <SwapIcon size={14} />
          {t.transfer}
        </a>
      </div>

      <section className="flex flex-col gap-3.5 rounded-card border border-line bg-surface px-5 pb-5 pt-[18px] shadow-card">
        <span className="text-xs font-semibold text-ink-4">{t.searchTitle}</span>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          <Labeled label={t.fields.pk}>{input('pk')}</Labeled>
          <Labeled label={t.fields.name}>{input('name')}</Labeled>
          <Labeled label={t.fields.email}>{input('email')}</Labeled>
          <Labeled label={t.fields.role}>
            <Select className="h-9" value={draft.role} onChange={set('role')}>
              <option value="">{t.all}</option>
              {SYSTEM_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </Labeled>
          <Labeled label={t.fields.phone}>{input('phone')}</Labeled>
          <Labeled label={t.fields.empNo}>{input('empNo')}</Labeled>
          <Labeled label={t.fields.dept}>{input('dept')}</Labeled>
          <Labeled label={t.fields.title}>{input('title')}</Labeled>
          <Labeled label={t.fields.migrated}>
            <Select className="h-9" value={draft.migrated} onChange={set('migrated')}>
              <option value="">{t.all}</option>
              <option value="true">{t.migratedYes}</option>
              <option value="false">{t.migratedNo}</option>
            </Select>
          </Labeled>
          <Labeled label={t.fields.loginFrom}>{input('loginFrom', { type: 'date' })}</Labeled>
          <Labeled label={t.fields.dateFrom}>
            <div className="flex flex-col gap-1.5">
              {(
                [
                  ['createdFrom', t.fields.createdFrom],
                  ['joinFrom', t.fields.joinFrom],
                  ['updatedFrom', t.fields.updatedFrom],
                ] as const
              ).map(([k, label]) => (
                <div key={k} className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-xs text-ink-4">{label}</span>
                  <TextInput aria-label={label} type="date" className="h-9 min-w-0 flex-1" value={draft[k]} onChange={set(k)} />
                </div>
              ))}
            </div>
          </Labeled>
          <Labeled label={t.fields.active}>
            <Select className="h-9" value={draft.active} onChange={set('active')}>
              <option value="">{t.all}</option>
              <option value="true">{t.activeYes}</option>
              <option value="false">{t.activeNo}</option>
            </Select>
          </Labeled>
          <div className="flex items-end gap-2 lg:col-start-4">
            <Button variant="secondary" onClick={() => { setDraft(blank); setApplied(blank) }} className="h-9 rounded-ctl px-3.5 font-medium">
              {t.reset}
            </Button>
            <Button variant="dark" icon={<SearchIcon size={14} strokeWidth={2.4} />} onClick={() => setApplied({ ...draft })} className="h-9 flex-1 rounded-[10px] px-[18px] text-[13.5px] font-semibold">
              {t.search}
            </Button>
          </div>
        </div>
      </section>

      <section className="min-w-0 overflow-hidden rounded-card border border-line bg-surface shadow-card" aria-label={t.resultTitle}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-5 py-3.5">
          <span className="flex items-baseline gap-2">
            <span className="text-[15px] font-semibold">{t.resultTitle}</span>
            <span className="text-[13px] text-ink-4" aria-live="polite">
              {t.footer(rows.length, nowText)} · {t.pages}
            </span>
          </span>
          <button type="button" onClick={() => setExporting(true)} className="inline-flex h-8 items-center gap-[7px] rounded-ctl bg-[#73bfb8] px-3.5 text-[13px] font-semibold text-[#0f3b37] hover:brightness-105">
            <DownloadIcon size={14} />
            {t.export}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1500px] border-collapse text-[13px]">
            <thead>
              <tr>
                <th scope="col" className={cn(th, 'w-7 pl-3.5 pr-0')}>
                  <span className="sr-only">{t.columns.detail}</span>
                </th>
                {(['pk', 'name', 'email', 'role', 'phone', 'empNo', 'dept', 'title', 'migrated', 'lastLogin', 'dates', 'active', 'desc', 'action'] as const).map((c) => (
                  <th key={c} scope="col" className={th}>
                    {t.columns[c]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => {
                const isOpen = u.id in open
                return (
                  <Fragment key={u.id}>
                    <tr className={cn('border-t border-line-soft', isOpen ? 'bg-primary-soft' : u.active ? 'bg-surface' : 'bg-[#fafafb]', !u.active && 'opacity-60')}>
                      <td className="w-7 py-[9px] pl-3 pr-0 align-top">
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-label={t.detailToggle}
                          title={t.detailToggleTitle}
                          onClick={() =>
                            setOpen((prev) => {
                              const next = { ...prev }
                              if (u.id in next) delete next[u.id]
                              else next[u.id] = ''
                              return next
                            })
                          }
                          className={cn('inline-flex size-6 items-center justify-center rounded-md border p-0', isOpen ? 'border-primary bg-[#f2f2f5]' : 'border-[#c7c7cc] bg-surface text-ink-2')}
                        >
                          <ChevronRightIcon size={12} className={cn('transition-transform', isOpen && 'rotate-90')} />
                        </button>
                      </td>
                      <td className={cn(td, 'font-mono text-xs tabular-nums text-ink-3')}>{u.pk}</td>
                      <td className={cn(td, 'font-medium')}>{u.name}</td>
                      <td className={cn(td, 'text-ink-2')}>{u.email}</td>
                      <td className="px-3.5 py-3 align-top">
                        <span className="flex flex-col gap-1 leading-tight">
                          {u.roles.map((r) => (
                            <span key={r}>{r}</span>
                          ))}
                        </span>
                      </td>
                      <td className={cn(td, 'tabular-nums text-ink-2')}>{u.phone}</td>
                      <td className={cn(td, 'font-mono text-xs text-ink-2')}>{u.empNo}</td>
                      <td className={cn(td, 'text-ink-2')}>{u.dept}</td>
                      <td className={cn(td, 'text-ink-2')}>{u.title}</td>
                      <td className={cn(td, 'text-ink-2')}>{u.migrated ? t.migratedYes : t.migratedNo}</td>
                      <td className={cn(td, 'tabular-nums text-ink-3')}>{u.lastLogin}</td>
                      <td className="whitespace-nowrap px-3.5 py-2.5 align-top tabular-nums">
                        {(
                          [
                            [t.dates.created, u.createdAt],
                            [t.dates.joined, u.joinedAt],
                            [t.dates.updated, u.updatedAt],
                          ] as const
                        ).map(([label, value]) => (
                          <div key={label} className="flex items-baseline gap-1.5 leading-[18px]">
                            <span className="inline-block w-[52px] text-[11px] text-ink-4">{label}</span>
                            <span className="font-mono text-xs">{value}</span>
                          </div>
                        ))}
                      </td>
                      <td className={td}>
                        <span className={cn('inline-flex items-center gap-1.5', !u.active && 'text-ink-4')}>
                          <span aria-hidden="true" className={cn('size-2 shrink-0 rounded-full', u.active ? 'bg-success' : 'bg-ink-5')} />
                          {u.active ? t.activeYes : t.activeNo}
                        </span>
                      </td>
                      <td className="min-w-[180px] px-3.5 py-3 align-top text-ink-3">{u.desc}</td>
                      <td className="py-2 pl-3.5 pr-5 align-top">
                        <Button size="sm" icon={<EditIcon size={12} />} onClick={() => setEditing(u)} className="h-7 rounded-ctl px-3 text-[12.5px] font-semibold">
                          {t.edit}
                        </Button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="border-t border-primary/30 bg-[#f4f8fc]">
                        {/* 상세 · PK ~ 일자 열까지(12칸)만 펼친다 */}
                        <td colSpan={12} className="p-0">
                          <UserDocsDetail
                            user={u}
                            selected={open[u.id] ?? ''}
                            page={pages[u.id] ?? 1}
                            onSelect={(kind) => {
                              setOpen((prev) => ({ ...prev, [u.id]: kind }))
                              setPages((prev) => ({ ...prev, [u.id]: 1 }))
                            }}
                            onPage={(p) => setPages((prev) => ({ ...prev, [u.id]: p }))}
                          />
                        </td>
                        <td colSpan={3} className="p-0" />
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="flex flex-col gap-1.5 px-6 py-14 text-center">
              <span className="text-[15px] font-semibold text-ink-2">{t.emptyTitle}</span>
              <span className="text-[13px] text-ink-4">{t.emptyDescription}</span>
            </div>
          )}
        </div>
      </section>

      {editing && (
        <UserEditModal
          user={editing}
          onClose={() => setEditing(null)}
          onSave={(next, ticket) => {
            setUsers((prev) => prev.map((u) => (u.id === next.id ? next : u)))
            setEditing(null)
            setToast(t.saved(next.name, ticket))
          }}
        />
      )}
      {exporting && (
        <UserExportModal
          count={rows.length}
          conditions={conditions}
          onClose={() => setExporting(false)}
          onRun={(ticket) => {
            setExporting(false)
            setToast(t.exported(rows.length, ticket))
          }}
        />
      )}
    </CompanyShell>
  )
}
