import { useState } from 'react'
import { ArrowRightIcon, CheckIcon, CloseIcon, InfoIcon, SearchIcon } from '../../components/icons'
import { CompanyShell } from '../../components/layout/CompanyShell'
import { Button, Card, EmptyState, Field, TextInput } from '../../components/ui'
import { cn } from '../../lib/cn'
import { MOCK_TRANSFER_DIRECTORY, MOCK_TRANSFER_DOCS, TRANSFER_ROLE_SETS } from '../../mocks/user'
import type { TransferType } from '../../mocks/user'
import { texts } from '../../texts'
import { UserTransferModal } from './UserTransferModal'

const t = texts.user.transfer
const TYPES: TransferType[] = ['계약', '자문', '소송']

type Person = { name: string; email: string; userId: string }

function findUser(p: Person) {
  return MOCK_TRANSFER_DIRECTORY.find((d) => d.name === p.name.trim() && d.email.toLowerCase() === p.email.trim().toLowerCase() && d.userId === p.userId.trim())
}

function StepNo({ n }: { n: number }) {
  return <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">{n}</span>
}

/** 이름 · 이메일 · user_id 입력과 일치 결과 */
function PersonBox({ title, value, onChange, role }: { title: string; value: Person; onChange: (next: Person) => void; role: string }) {
  const hit = findUser(value)
  const typed = value.name || value.email || value.userId
  const tone = hit ? 'border-success-line bg-success-soft text-success-ink' : typed ? 'border-danger-line bg-danger-soft text-danger-ink' : 'border-line-strong bg-[#f2f2f5] text-ink'
  const message = hit ? t.matched(hit.name, hit.userId) : typed ? t.mismatch : t.enter(role)
  return (
    <div className="flex min-w-[320px] flex-1 flex-col gap-3 rounded-xl border border-ink-2 bg-surface p-4">
      <span className="text-xs font-bold text-ink">{title}</span>
      <div className="grid grid-cols-3 gap-2.5">
        <Field label={t.userFields.name}>{(id) => <TextInput id={id} className="h-9" value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} />}</Field>
        <Field label={t.userFields.email}>{(id) => <TextInput id={id} className="h-9" value={value.email} onChange={(e) => onChange({ ...value, email: e.target.value })} />}</Field>
        <Field label={t.userFields.userId}>{(id) => <TextInput id={id} className="h-9 font-mono text-[12.5px]" value={value.userId} onChange={(e) => onChange({ ...value, userId: e.target.value })} />}</Field>
      </div>
      <div role="status" className={cn('flex items-start gap-2 rounded-[10px] border px-3 py-[9px] text-[12.5px] leading-snug', tone)}>
        {hit ? <CheckIcon size={15} className="mt-px shrink-0" /> : typed ? <CloseIcon size={15} className="mt-px shrink-0" /> : <InfoIcon size={15} className="mt-px shrink-0" />}
        <span className="flex-1">{message}</span>
      </div>
    </div>
  )
}

const th = 'whitespace-nowrap border-b border-line-soft px-3.5 py-2.5 text-left text-xs font-medium text-ink-4'
const td = 'h-12 whitespace-nowrap px-3.5'

/** 계약 · 자문 · 소송 이관 */
export function UserTransferPage() {
  const [type, setType] = useState<TransferType>('계약')
  const [from, setFrom] = useState<Person>({ name: '박지훈', email: 'jihoon.park@acetech.co.kr', userId: 'A00123' })
  const [to, setTo] = useState<Person>({ name: '이서연', email: 'seoyeon.lee@acetech.co.kr', userId: 'A00241' })
  const [moved, setMoved] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [confirming, setConfirming] = useState(false)
  const [toast, setToast] = useState('')

  const fromHit = findUser(from)
  const toHit = findUser(to)

  const all = (fromHit ? MOCK_TRANSFER_DOCS[type] : []).filter((d) => !moved.includes(d.id))
  const q = query.trim().toLowerCase()
  const byQuery = q ? all.filter((d) => d.id.toLowerCase().includes(q) || d.id.toLowerCase().replace(/-/g, '').includes(q.replace(/-/g, ''))) : all
  const roleSet = TRANSFER_ROLE_SETS[type]
  const activeRoles = roleFilter.filter((r) => roleSet.includes(r))
  const list = activeRoles.length ? byQuery.filter((d) => d.roles.some((r) => activeRoles.includes(r))) : byQuery
  const selectable = list.filter((d) => d.grade === '일반')
  const selected = selectedIds.filter((id) => all.some((d) => d.id === id))
  const allChecked = selectable.length > 0 && selectable.every((d) => selected.includes(d.id))
  const canTransfer = !!(fromHit && toHit && fromHit.userId !== toHit.userId && selected.length > 0)

  const stats = [
    { label: t.stats.all(type), value: all.length, tone: 'text-ink' },
    { label: t.stats.secure, value: all.filter((d) => d.grade === '보안').length, tone: 'text-danger-ink' },
    { label: t.stats.normal, value: all.filter((d) => d.grade === '일반').length, tone: 'text-ink' },
    { label: t.stats.done, value: all.filter((d) => d.status === '완료').length, tone: 'text-success-ink' },
    { label: t.stats.ongoing, value: all.filter((d) => d.status === '진행중').length, tone: 'text-[#7a5800]' },
  ]

  const changePerson = (setter: (p: Person) => void) => (next: Person) => {
    setter(next)
    setSelectedIds([])
  }

  return (
    <CompanyShell active="user" trail={[{ label: texts.user.breadcrumb.features }, { label: texts.user.breadcrumb.user, href: '?user' }, { label: t.title }]}>
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
        </div>
        <a href="?user" className="inline-flex h-[34px] items-center gap-1.5 rounded-ctl border border-line-strong bg-surface px-3.5 text-[13px] font-medium text-ink hover:bg-hover">
          <ArrowRightIcon size={13} className="rotate-180" />
          {t.back}
        </a>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-line-strong bg-[#f2f2f5] px-3.5 py-3 text-[13px] leading-normal">
        <InfoIcon size={15} className="mt-0.5 shrink-0 text-ink-3" />
        <span>{t.description}</span>
      </div>

      <section className="flex flex-col gap-[18px] rounded-card border border-line bg-surface px-[22px] pb-[22px] pt-5 shadow-card">
        <div className="flex flex-wrap items-center gap-3.5">
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <StepNo n={1} />
            {t.step1}
          </span>
          <div role="group" aria-label={t.typeLabel} className="inline-flex gap-0.5 rounded-[9px] bg-[#ebebef] p-0.5">
            {TYPES.map((o) => (
              <button
                key={o}
                type="button"
                aria-pressed={type === o}
                onClick={() => {
                  setType(o)
                  setSelectedIds([])
                  setQuery('')
                  setRoleFilter([])
                }}
                className={cn('h-7 rounded-[7px] px-[18px] text-[13px]', type === o ? 'bg-surface font-semibold shadow-seg' : 'font-medium text-ink-3')}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
        <div className="h-px bg-line-soft" />
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <StepNo n={2} />
            {t.step2}
          </span>
          <span className="text-[12.5px] text-ink-4">{t.step2Hint}</span>
        </div>
        <div className="flex flex-wrap items-stretch gap-3">
          <PersonBox title={t.from} role={t.from} value={from} onChange={changePerson(setFrom)} />
          <div className="flex items-center text-ink-5">
            <ArrowRightIcon size={20} />
          </div>
          <PersonBox title={t.to} role={t.to} value={to} onChange={changePerson(setTo)} />
        </div>
      </section>

      <dl className="m-0 grid grid-cols-2 gap-3 md:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label} className="flex flex-col gap-1 px-4 py-3.5">
            <dt className="text-xs font-medium text-ink-4">{s.label}</dt>
            <dd className="m-0 flex items-baseline gap-[3px]">
              <span className={cn('text-2xl font-bold tabular-nums tracking-[-0.02em]', s.tone)}>{s.value}</span>
              <span className="text-[13px] text-ink-4">{t.stats.unit}</span>
            </dd>
          </Card>
        ))}
      </dl>

      <Card className="min-w-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-5 py-3.5">
          <span className="inline-flex items-center gap-2">
            <StepNo n={3} />
            <span className="text-[15px] font-semibold">{t.step3(type)}</span>
            <span className="text-[13px] text-ink-4" aria-live="polite">
            </span>
          </span>
          <form role="search" className="flex min-w-0 items-center gap-2" onSubmit={(e) => e.preventDefault()}>
            <label className="relative block w-[280px] max-w-full">
              <span className="pointer-events-none absolute left-[11px] top-2.5 inline-flex text-ink-4">
                <SearchIcon size={15} strokeWidth={2.2} />
              </span>
              <input
                type="search"
                autoComplete="off"
                aria-label={t.searchLabel(type)}
                placeholder={t.searchPlaceholder(type)}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-9 w-full rounded-[10px] border-0 bg-[#f2f2f5] pl-[34px] pr-3 text-[13.5px] placeholder:text-ink-4 focus:outline-none focus:shadow-[0_0_0_3px_rgb(35_100_170/0.22)]"
              />
            </label>
            <Button type="submit" variant="dark" icon={<SearchIcon size={14} strokeWidth={2.4} />} className="h-9 rounded-[10px] px-[18px] text-[13.5px] font-semibold">
              {t.search}
            </Button>
          </form>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-line-soft bg-[#fafafb] px-5 py-3">
          <span className="mr-1 text-xs font-semibold text-ink-3">{t.roleHead(type)}</span>
          {roleSet.map((r) => {
            const on = activeRoles.includes(r)
            const count = byQuery.filter((d) => d.roles.includes(r)).length
            return (
              <button
                key={r}
                type="button"
                aria-pressed={on}
                onClick={() => setRoleFilter(on ? activeRoles.filter((x) => x !== r) : [...activeRoles, r])}
                className={cn('inline-flex h-[30px] items-center gap-1.5 rounded-ctl px-[11px] text-[12.5px]', on ? 'border-[1.5px] border-primary bg-[#f2f2f5] font-semibold' : 'border border-[#aeaeb2] bg-surface font-medium')}
              >
                {on && <CheckIcon size={11} strokeWidth={3} />}
                <span>{r}</span>
                <span className={cn('text-[11.5px] font-semibold tabular-nums', on ? 'text-primary' : count ? 'text-ink-3' : 'text-[#c7c7cc]')}>{count}</span>
              </button>
            )
          })}
          <span className="flex-1" />
          {activeRoles.length > 0 && (
            <button type="button" onClick={() => setRoleFilter([])} className="h-7 rounded-[7px] border border-line-strong bg-surface px-2.5 text-xs">
              {t.clearRoles}
            </button>
          )}
          <Button disabled={!canTransfer} onClick={() => setConfirming(true)} className="h-[34px] rounded-ctl px-4 text-[13px] font-semibold">
            {t.run(type, selected.length)}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-[13.5px]">
            <thead>
              <tr>
                <th scope="col" className={cn(th, 'w-7 pl-5')}>
                  <input
                    type="checkbox"
                    aria-label={t.selectAll}
                    checked={allChecked}
                    onChange={() => setSelectedIds(allChecked ? [] : selectable.map((d) => d.id))}
                    className="m-0 size-[15px] accent-primary"
                  />
                </th>
                <th scope="col" className={th}>{t.columns.id(type)}</th>
                <th scope="col" className={th}>{t.columns.title}</th>
                <th scope="col" className={th}>{t.roleHead(type)}</th>
                <th scope="col" className={th}>{t.columns.status}</th>
                <th scope="col" className={th}>{t.columns.grade}</th>
                <th scope="col" className={cn(th, 'pr-5')}>{t.columns.createdAt}</th>
              </tr>
            </thead>
            <tbody>
              {list.map((d) => {
                const secure = d.grade === '보안'
                const on = selected.includes(d.id)
                return (
                  <tr key={d.id} className={cn('border-t border-line-soft', secure ? 'bg-[#fafafb] opacity-55' : on ? 'bg-primary-soft' : 'bg-surface')}>
                    <td className={cn(td, 'pl-5')}>
                      <input
                        type="checkbox"
                        aria-label={d.id}
                        checked={on}
                        disabled={secure}
                        onChange={() => setSelectedIds(on ? selected.filter((x) => x !== d.id) : [...selected, d.id])}
                        className="m-0 size-[15px] accent-primary"
                      />
                    </td>
                    <td className={cn(td, 'font-mono text-[12.5px] text-ink-2')}>{d.id}</td>
                    <td className={cn(td, 'min-w-[240px] font-medium')}>{d.title}</td>
                    <td className={td}>
                      <span className="inline-flex gap-1">
                        {d.roles.map((r) => (
                          <span key={r} className="inline-flex h-[22px] items-center rounded-md border border-line-strong bg-surface px-2 text-[11.5px] font-medium text-ink-2">
                            {r}
                          </span>
                        ))}
                      </span>
                    </td>
                    <td className={td}>
                      <span className={cn('inline-flex h-[22px] items-center rounded-full px-[9px] text-[11.5px] font-semibold', d.status === '완료' ? 'bg-success-soft text-success-ink' : 'bg-[#f2f2f5] text-ink')}>{d.status}</span>
                    </td>
                    <td className={td}>
                      <span className={cn('inline-flex h-[22px] items-center rounded-full px-[9px] text-[11.5px] font-semibold', secure ? 'bg-danger-soft text-danger-ink' : 'bg-[#f2f2f5] text-ink-3')}>{d.grade}</span>
                    </td>
                    <td className={cn(td, 'pr-5 tabular-nums text-ink-3')}>{d.createdAt}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {list.length === 0 && <EmptyState title={fromHit ? t.empty(type) : t.emptyNoUser} />}
        </div>
      </Card>

      {confirming && fromHit && toHit && (
        <UserTransferModal
          type={type}
          from={fromHit}
          to={toHit}
          ids={selected}
          onClose={() => setConfirming(false)}
          onConfirm={(ticket) => {
            setMoved((prev) => [...prev, ...selected])
            setSelectedIds([])
            setConfirming(false)
            setToast(t.done(type, selected.length, toHit.name, ticket))
          }}
        />
      )}
    </CompanyShell>
  )
}
