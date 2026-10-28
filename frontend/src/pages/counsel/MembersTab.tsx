import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronRightIcon, EditIcon, PlusIcon } from '../../components/icons'
import { Button, SegmentedControl } from '../../components/ui'
import { cn } from '../../lib/cn'
import type { CounselApprovalStatus, CounselMember } from '../../mocks/counsel'
import type { MemberKind } from '../../mocks/contract'
import { texts } from '../../texts'
import { deletedName } from '../contract/format'
import { DeletedBadge } from '../contract/shared'
import { ExternalMemberAddModal } from './ExternalMemberAddModal'
import { MemberAddModal } from './MemberAddModal'
import { MemberEditModal } from './MemberEditModal'

const t = texts.counsel.members

/** 사내 유저는 user_id(사번)를 가진다. 없으면 외부 유저 */
const kindOf = (m: CounselMember): MemberKind => (m.userId ? 'internal' : 'external')

const approvalTone: Record<CounselApprovalStatus, string> = {
  등록: 'bg-[#f2f2f5] text-ink-3',
  요청: 'bg-warn-soft text-warn-ink',
  승인: 'bg-success-soft text-success-ink',
  '부결/반려': 'bg-danger-soft text-danger-ink',
  '자문 중단': 'bg-[#f2f2f5] text-ink-4',
}

/** 작은 항목 이름표 */
function Cell({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-[5px] bg-surface px-3 py-2.5', className)}>
      <dt className="text-xs font-semibold text-ink-3">{label}</dt>
      <dd className="m-0 font-medium">{children}</dd>
    </div>
  )
}

function MemberCard({ m, onEdit }: { m: CounselMember; onEdit: () => void }) {
  const kind = kindOf(m)
  const internal = kind === 'internal'
  return (
    <li
      className={cn(
        'flex min-w-0 flex-col gap-3.5 rounded-card px-5 py-[18px]',
        m.deleted
          ? 'border border-danger-line bg-[#fafafb] shadow-[inset_3px_0_0_var(--color-danger),0_2px_6px_rgba(0,0,0,0.06),0_10px_24px_-12px_rgba(0,0,0,0.18)]'
          : 'border border-line bg-surface shadow-[0_2px_6px_rgba(0,0,0,0.06),0_10px_24px_-12px_rgba(0,0,0,0.18)]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex min-w-0 flex-col gap-1 leading-tight">
          <span className="flex flex-wrap items-center gap-2">
            <span className={cn('text-[17px] font-bold tracking-[-0.01em]', m.deleted && deletedName)}>{m.name}</span>
            <span
              className={cn(
                'rounded-full px-[9px] py-[3px] text-[11px] font-semibold',
                m.deleted ? 'bg-[#f2f2f5] text-ink-4' : internal ? 'bg-[#fff1d6] text-[#7a5800]' : 'bg-[#f0effd] text-[#4b49c8]',
              )}
            >
              {t.kind[kind]}
            </span>
            {m.deleted && <DeletedBadge label={t.deleted} />}
          </span>
          <span className="truncate text-[13px] text-ink-3">{m.email}</span>
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

      <div className="flex flex-wrap items-center gap-2">
        {m.roles.map((r) => (
          <span key={r} className={cn('inline-flex h-7 items-center rounded-md px-3 text-[13px] font-semibold leading-none', m.deleted ? 'bg-[#f2f2f5] text-ink-4' : 'bg-[#d6336c] text-white')}>
            {r}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-[minmax(0,1fr)_220px_210px]">
        <dl className="m-0 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-line-strong bg-line-soft text-sm shadow-card">
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
          <Cell label={t.cells.sysRoles} className="col-span-2">
            {internal && m.sysRoles.length > 0 ? (
              <span className="flex flex-wrap gap-1.5">
                {m.sysRoles.map((r) => (
                  <span key={r} className="inline-flex h-6 items-center rounded-md border border-line-strong bg-surface px-2 text-xs font-medium leading-none text-ink-2">
                    {r}
                  </span>
                ))}
              </span>
            ) : (
              <span className="text-ink-5">{t.none}</span>
            )}
          </Cell>
        </dl>

        <section aria-label={t.cells.approval} className="flex flex-col overflow-hidden rounded-[10px] border border-line-strong bg-surface shadow-card">
          <h4 className="m-0 border-b border-line-strong bg-[#f2f2f5] px-3.5 py-2 text-[13px] font-bold text-ink">{t.cells.approval}</h4>
          <dl className="m-0 grid grid-cols-[88px_minmax(0,1fr)] content-start items-center gap-x-2.5 gap-y-2 px-3.5 py-3 text-[13px]">
            <dt className="text-xs text-ink-3">{t.cells.approvalType}</dt>
            <dd className="m-0 min-h-[1lh]">{m.approvalType}</dd>
            <dt className="text-xs text-ink-3">{t.cells.approvalStatus}</dt>
            <dd className="m-0 min-h-[1lh]">
              {m.approvalStatus && (
                <span className={cn('inline-flex items-center rounded-full px-[9px] py-[3px] text-[11px] font-semibold', m.deleted ? 'bg-[#f2f2f5] text-ink-4' : approvalTone[m.approvalStatus])}>{m.approvalStatus}</span>
              )}
            </dd>
          </dl>
        </section>

        <section aria-label={t.cells.dates} className="flex flex-col overflow-hidden rounded-[10px] border border-line-strong bg-surface shadow-card">
          <h4 className="m-0 border-b border-line-strong bg-[#f2f2f5] px-3.5 py-2 text-[13px] font-bold text-ink">{t.cells.dates}</h4>
          <dl className="m-0 grid grid-cols-[40px_minmax(0,1fr)] content-start gap-x-2.5 gap-y-2 px-3.5 py-3 text-[13px]">
            <dt className="text-xs text-ink-3">{t.cells.created}</dt>
            <dd className="m-0 whitespace-nowrap tabular-nums">{m.createdAt || '-'}</dd>
            <dt className="text-xs text-ink-3">{t.cells.updated}</dt>
            <dd className="m-0 whitespace-nowrap tabular-nums">{m.updatedAt || '-'}</dd>
            <dt className="text-xs text-ink-3">{t.cells.deletedAt}</dt>
            <dd className="m-0 whitespace-nowrap tabular-nums">{m.deletedAt ? <span className="font-medium text-danger-ink">{m.deletedAt}</span> : <span className="text-ink-4">-</span>}</dd>
          </dl>
        </section>
      </div>
    </li>
  )
}

type Props = {
  counselId: string
  members: CounselMember[]
  onEdit: (next: CounselMember, ticket: string) => void
  onAdd: (member: CounselMember, ticket: string) => void
}

/** 참여 유저 탭 */
export function MembersTab({ counselId, members, onEdit, onAdd }: Props) {
  const [editing, setEditing] = useState<CounselMember | null>(null)
  const [adding, setAdding] = useState<MemberKind | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [includeDeleted, setIncludeDeleted] = useState(true)
  // 유저 생성 시각 기준 정렬. 기본은 오래된 순
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')
  // 내부 유저 / 외부 유저 필터. 빈 문자열이면 전체
  const [kindFilter, setKindFilter] = useState<'' | MemberKind>('')
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

  const visible = members.filter((m) => includeDeleted || !m.deleted)
  const shown = visible
    .filter((m) => !kindFilter || kindOf(m) === kindFilter)
    .sort((a, b) => (order === 'asc' ? 1 : -1) * (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0))
  const internalCount = shown.filter((m) => kindOf(m) === 'internal').length

  return (
    <section aria-labelledby="counsel-members-title" className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-4 px-3">
        <div className="flex flex-wrap items-baseline gap-2">
          <h2 id="counsel-members-title" className="m-0 text-[13px] font-semibold">
            {t.title}
          </h2>
          <span className="text-xs tabular-nums text-ink-4">{t.summary(shown.length, internalCount, shown.length - internalCount)}</span>
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
        <div className="flex flex-wrap items-center justify-start gap-x-5 gap-y-2 px-5 pb-0 pt-3 text-xs text-ink-4">
          <label className="inline-flex cursor-pointer select-none items-center gap-1.5 text-[12.5px] text-ink">
            <input type="checkbox" checked={includeDeleted} onChange={(e) => setIncludeDeleted(e.target.checked)} className="m-0 size-[15px] accent-primary" />
            {t.includeDeleted}
          </label>
          <span aria-hidden="true" className="h-3 w-px bg-line-strong" />
          <span className="inline-flex flex-wrap items-center justify-start gap-x-5 gap-y-2">
            <span className="inline-flex items-center gap-2">
              <span className="text-xs text-ink-4">{t.filter.label}</span>
              <SegmentedControl
                label={t.filter.label}
                value={kindFilter}
                onChange={setKindFilter}
                options={[
                  { value: '', label: `${t.filter.all} ${visible.length}` },
                  { value: 'internal', label: `${t.kind.internal} ${visible.filter((m) => kindOf(m) === 'internal').length}` },
                  { value: 'external', label: `${t.kind.external} ${visible.filter((m) => kindOf(m) === 'external').length}` },
                ]}
              />
            </span>
            <span aria-hidden="true" className="h-3 w-px bg-line-strong" />
            <span className="inline-flex items-center gap-2">
              <span className="text-xs text-ink-4">{t.sort.label}</span>
              <SegmentedControl
                label={t.sort.label}
                value={order}
                onChange={setOrder}
                options={[
                  { value: 'desc', label: t.sort.desc },
                  { value: 'asc', label: t.sort.asc },
                ]}
              />
            </span>
          </span>
        </div>
        <ul className="m-0 flex list-none flex-col gap-3 p-5">
          {shown.map((m) => (
            <MemberCard key={m.id} m={m} onEdit={() => setEditing(m)} />
          ))}
          {shown.length === 0 && <li className="py-8 text-center text-[13px] text-ink-4">{t.emptyFiltered}</li>}
        </ul>
      </div>

      {editing && (
        <MemberEditModal
          counselId={counselId}
          member={editing}
          onClose={() => setEditing(null)}
          onSave={(next, ticket) => {
            onEdit(next, ticket)
            setEditing(null)
          }}
        />
      )}
      {adding === 'internal' && (
        <MemberAddModal
          members={members}
          onClose={() => setAdding(null)}
          onSave={(member, ticket) => {
            onAdd(member, ticket)
            setAdding(null)
          }}
        />
      )}
      {adding === 'external' && (
        <ExternalMemberAddModal
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
