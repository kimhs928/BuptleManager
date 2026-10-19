import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronRightIcon, EditIcon, InfoIcon, PlusIcon } from '../../components/icons'
import { Button } from '../../components/ui'
import { cn } from '../../lib/cn'
import type { ContractMember, MemberKind } from '../../mocks/contract'
import { texts } from '../../texts'
import { deletedName } from './format'
import { DeletedBadge } from './shared'
import { MemberAddModal } from './MemberAddModal'
import { MemberEditModal } from './MemberEditModal'

const t = texts.contract.members

const signTone: Record<string, string> = {
  완료: 'rounded-full bg-success-soft px-[9px] py-[3px] text-[11px] font-semibold text-success-ink',
  대기: 'rounded-full bg-warn-soft px-[9px] py-[3px] text-[11px] font-semibold text-[#7a5800]',
  거부: 'rounded-full bg-danger-soft px-[9px] py-[3px] text-[11px] font-semibold text-danger-ink',
}

/** 작은 항목 이름표 */
function Cell({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-[5px] bg-surface px-3 py-2.5', className)}>
      <dt className="text-[11px] font-semibold text-ink-4">{label}</dt>
      <dd className="m-0">{children}</dd>
    </div>
  )
}

function MemberCard({ m, onEdit }: { m: ContractMember; onEdit: () => void }) {
  const internal = m.kind === 'internal'
  return (
    <li className={cn('flex min-w-0 flex-col gap-3.5 rounded-card px-5 py-[18px]', m.deleted ? 'border border-danger-line bg-[#fafafb] shadow-[inset_3px_0_0_var(--color-danger)]' : 'border border-line bg-surface')}>
      <div className="flex items-start justify-between gap-3">
        <span className="flex min-w-0 flex-col gap-1 leading-tight">
          <span className="flex flex-wrap items-center gap-2">
            <span className={cn('text-[15px] font-semibold', m.deleted && deletedName)}>{m.name}</span>
            <span className={cn('rounded-full bg-[#f2f2f5] px-[9px] py-[3px] text-[11px] font-semibold', internal ? 'text-ink' : 'text-ink-2')}>{t.kind[m.kind]}</span>
            {m.deleted && <DeletedBadge label={t.deleted} />}
          </span>
          <span className="truncate text-xs text-ink-4">{m.email}</span>
        </span>
        <button
          type="button"
          aria-label={`${m.name} ${t.edit}`}
          title={`${m.name} ${t.edit}`}
          onClick={onEdit}
          className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-ctl bg-primary text-white hover:brightness-105"
        >
          <EditIcon size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-[minmax(0,1fr)_220px_210px]">
        <dl className="m-0 grid grid-cols-[minmax(0,1.1fr)_minmax(0,0.6fr)_minmax(0,1.5fr)] gap-px overflow-hidden rounded-[10px] border border-line-soft bg-line-soft text-[13px]">
          <Cell label={t.cells.roles}>
            <span className="flex flex-wrap gap-1">
              {m.roles.map((r) => (
                <span key={r} className="inline-flex h-[22px] items-center rounded-md border border-divider bg-surface px-2 text-xs font-medium leading-none text-ink-2">
                  {r}
                </span>
              ))}
            </span>
          </Cell>
          <Cell label={t.cells.perm}>
            {internal && m.perm.length > 0 ? (
              <span className="inline-flex h-[22px] items-center rounded-full bg-[#f2f2f5] px-[9px] text-[11px] font-semibold text-ink-2">{m.perm.join(', ')}</span>
            ) : (
              <span className="text-ink-4">{t.none}</span>
            )}
          </Cell>
          <Cell label={t.cells.org}>
            <span className="flex flex-wrap items-center gap-x-1.5 leading-snug">
              <span>{m.company}</span>
              <ChevronRightIcon size={11} className="text-ink-5" />
              <span className="font-semibold">{m.dept}</span>
            </span>
          </Cell>
          <Cell label={t.cells.phone}>
            <span className="whitespace-nowrap tabular-nums">{m.phone}</span>
          </Cell>
          <Cell label={t.cells.lang}>{texts.contract.lang[m.lang]}</Cell>
          <Cell label={t.cells.sysRoles}>
            <span className="flex flex-wrap gap-x-2.5 gap-y-1 text-ink-2">{internal && m.sysRoles.length > 0 ? m.sysRoles.map((r) => <span key={r}>{r}</span>) : <span>{t.none}</span>}</span>
          </Cell>
        </dl>

        <dl className="m-0 grid grid-cols-[64px_minmax(0,1fr)] content-start gap-x-2.5 gap-y-2 rounded-[10px] bg-bg px-3.5 py-3 text-[13px]">
          <dt className="col-span-full text-[11px] font-semibold text-ink-4">{t.cells.sign}</dt>
          <dt className="text-xs text-ink-3">{t.cells.signMethod}</dt>
          <dd className="m-0">{m.signMethod}</dd>
          <dt className="text-xs text-ink-3">{t.cells.signType}</dt>
          <dd className="m-0">{m.signType}</dd>
          <dt className="text-xs text-ink-3">{t.cells.signStatus}</dt>
          <dd className="m-0">{signTone[m.signStatus] ? <span className={signTone[m.signStatus]}>{m.signStatus}</span> : <span className="text-ink-4">{m.signStatus}</span>}</dd>
        </dl>

        <dl className="m-0 grid grid-cols-[40px_minmax(0,1fr)] content-start gap-x-2.5 gap-y-2 rounded-[10px] bg-bg px-3.5 py-3 text-[13px]">
          <dt className="col-span-full text-[11px] font-semibold text-ink-4">{t.cells.dates}</dt>
          <dt className="text-xs text-ink-3">{t.cells.joined}</dt>
          <dd className="m-0 whitespace-nowrap tabular-nums">{m.joinedAt ? m.joinedAt.replace('T', ' ') : '-'}</dd>
          <dt className="text-xs text-ink-3">{t.cells.updated}</dt>
          <dd className="m-0 whitespace-nowrap tabular-nums">{m.updatedAt ? m.updatedAt.replace('T', ' ') : '-'}</dd>
          <dt className="text-xs text-ink-3">{t.cells.deletedAt}</dt>
          <dd className="m-0 whitespace-nowrap tabular-nums">{m.deletedAt ? <span className="font-medium text-danger-ink">{m.deletedAt.replace('T', ' ')}</span> : <span className="text-ink-4">-</span>}</dd>
        </dl>
      </div>
    </li>
  )
}

type Props = {
  members: ContractMember[]
  onEdit: (next: ContractMember, ticket: string) => void
  onAdd: (member: ContractMember, ticket: string) => void
}

/** 참여 유저 탭 */
export function MembersTab({ members, onEdit, onAdd }: Props) {
  const [editing, setEditing] = useState<ContractMember | null>(null)
  const [adding, setAdding] = useState<MemberKind | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // 메뉴 바깥을 누르거나 Esc를 누르면 닫는다
  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const internalCount = members.filter((m) => m.kind === 'internal').length

  return (
    <section aria-labelledby="members-title" className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-4 px-3">
        <div className="flex flex-wrap items-baseline gap-2">
          <h2 id="members-title" className="m-0 text-[13px] font-semibold">
            {t.title}
          </h2>
          <span className="text-xs text-ink-4">{t.description}</span>
        </div>
        <div ref={menuRef} className="relative">
          <Button aria-haspopup="menu" aria-expanded={menuOpen} icon={<PlusIcon size={14} strokeWidth={2.4} />} onClick={() => setMenuOpen((v) => !v)} className="h-9 rounded-ctl px-[18px] font-semibold">
            {t.add}
          </Button>
          {menuOpen && (
            <div role="menu" className="absolute right-0 top-[42px] z-10 flex w-[232px] flex-col gap-px rounded-xl bg-surface p-[5px] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.22),0_0_0_0.5px_rgba(0,0,0,0.1)]">
              {(['internal', 'external'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false)
                    setAdding(k)
                  }}
                  className="flex items-center gap-2.5 rounded-ctl px-2.5 py-2 text-left text-[13px] font-medium text-ink hover:bg-hover"
                >
                  <span aria-hidden="true" className={cn('inline-flex size-[26px] shrink-0 items-center justify-center rounded-[7px] bg-[#f2f2f5] text-xs font-bold', k === 'internal' ? 'text-ink' : 'text-ink-2')}>
                    {t.kind[k].slice(0, 1)}
                  </span>
                  <span className="flex flex-col gap-px leading-tight">
                    <span>{t.menu[k]}</span>
                    {k === 'internal' && <span className="text-[11px] font-normal text-ink-4">{t.menuInternalHint}</span>}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col rounded-card border border-line bg-surface shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-5 py-3 text-xs text-ink-4">
          <span className="tabular-nums">{t.summary(members.length, internalCount, members.length - internalCount)}</span>
          <span className="inline-flex items-center gap-1.5">
            <InfoIcon size={13} />
            <span>{t.footerHint}</span>
          </span>
        </div>
        <ul className="m-0 flex list-none flex-col gap-3 p-5">
          {members.map((m) => (
            <MemberCard key={m.id} m={m} onEdit={() => setEditing(m)} />
          ))}
        </ul>
      </div>

      {editing && (
        <MemberEditModal
          member={editing}
          onClose={() => setEditing(null)}
          onSave={(next, ticket) => {
            onEdit(next, ticket)
            setEditing(null)
          }}
        />
      )}
      {adding && (
        <MemberAddModal
          kind={adding}
          members={members}
          onClose={() => setAdding(null)}
          onSave={(member, ticket) => {
            onAdd(member, ticket)
            setAdding(null)
          }}
        />
      )}
    </section>
  )
}
