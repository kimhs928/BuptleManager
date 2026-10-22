import { useState } from 'react'
import { EditIcon, PlusIcon } from '../../components/icons'
import { Button } from '../../components/ui'
import { cn } from '../../lib/cn'
import type { LawsuitMember } from '../../mocks/lawsuit'
import { texts } from '../../texts'
import { deletedName, deletedRow, tableTd, tableTh } from '../contract/format'
import { DeletedBadge } from '../contract/shared'
import { MemberAddModal } from './MemberAddModal'
import { MemberEditModal } from './MemberEditModal'

const t = texts.lawsuit.members

type Props = {
  lawsuitId: string
  members: LawsuitMember[]
  onEdit: (next: LawsuitMember, ticket: string) => void
  onAdd: (member: LawsuitMember, ticket: string) => void
}

/** 참여 유저 탭 */
export function MembersTab({ lawsuitId, members, onEdit, onAdd }: Props) {
  const [editing, setEditing] = useState<LawsuitMember | null>(null)
  const [adding, setAdding] = useState(false)
  const [includeDeleted, setIncludeDeleted] = useState(true)

  const shown = members.filter((m) => includeDeleted || !m.deleted)
  const internalCount = shown.filter((m) => !!m.userId).length

  return (
    <section aria-labelledby="lawsuit-members-title" className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-4 px-3">
        <div className="flex flex-wrap items-baseline gap-2">
          <h2 id="lawsuit-members-title" className="m-0 text-[13px] font-semibold">
            {t.title}
          </h2>
          <span className="text-xs tabular-nums text-ink-4">{t.summary(shown.length, internalCount, shown.length - internalCount)}</span>
        </div>
        <div className="flex items-center gap-3">
          <Button icon={<PlusIcon size={14} strokeWidth={2.4} />} onClick={() => setAdding(true)} className="h-9 rounded-ctl px-[18px] font-semibold">
            {t.add}
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
        <div className="flex flex-wrap items-center justify-start gap-3 px-5 pb-3.5 pt-3.5 text-xs text-ink-4">
          <label className="inline-flex cursor-pointer select-none items-center gap-1.5 text-[12.5px] text-ink">
            <input type="checkbox" checked={includeDeleted} onChange={(e) => setIncludeDeleted(e.target.checked)} className="m-0 size-[15px] accent-primary" />
            {t.includeDeleted}
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse text-[13.5px]">
            <thead>
              <tr>
                <th scope="col" className={cn(tableTh, 'pl-5')}>{t.columns.user}</th>
                <th scope="col" className={tableTh}>{t.columns.company}</th>
                <th scope="col" className={tableTh}>{t.columns.phone}</th>
                <th scope="col" className={tableTh}>{t.columns.roles}</th>
                <th scope="col" className={tableTh}>{t.columns.dept}</th>
                <th scope="col" className={tableTh}>{t.columns.createdAt}</th>
                <th scope="col" className={tableTh}>{t.columns.updatedAt}</th>
                <th scope="col" className={tableTh}>{t.columns.deletedAt}</th>
                <th scope="col" className={cn(tableTh, 'pr-5 text-right')}>{t.columns.action}</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((m) => (
                <tr key={m.id} className={cn('border-t border-line-soft', m.deleted ? deletedRow : 'bg-surface hover:bg-hover')}>
                  <td className={cn(tableTd, 'pl-5')}>
                    <span className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-2">
                        <span className={cn('font-medium', m.deleted ? deletedName : 'text-ink')}>{m.name}</span>
                        {m.deleted && <DeletedBadge label={t.deletedLabel} />}
                      </span>
                      <span className="text-xs text-ink-4">{m.email}</span>
                    </span>
                  </td>
                  <td className={cn(tableTd, m.deleted ? 'text-ink-5' : 'text-ink-2')}>{m.company}</td>
                  <td className={cn(tableTd, 'whitespace-nowrap tabular-nums', m.deleted ? 'text-ink-5' : 'text-ink-2')}>{m.phone}</td>
                  <td className={tableTd}>
                    <span className="flex flex-wrap gap-1">
                      {m.roles.map((r) => (
                        <span key={r} className={cn('inline-flex h-[22px] items-center rounded-md px-2 text-xs font-semibold leading-none', m.deleted ? 'bg-[#f2f2f5] text-ink-4' : 'bg-[#d6336c] text-white')}>
                          {r}
                        </span>
                      ))}
                    </span>
                  </td>
                  <td className={cn(tableTd, 'whitespace-nowrap', m.deleted ? 'text-ink-5' : 'text-ink-2')}>{m.dept}</td>
                  <td className={cn(tableTd, 'whitespace-nowrap tabular-nums', m.deleted ? 'text-ink-5' : 'text-ink-3')}>{m.createdAt}</td>
                  <td className={cn(tableTd, 'whitespace-nowrap tabular-nums', m.deleted ? 'text-ink-5' : 'text-ink-3')}>{m.updatedAt}</td>
                  <td className={cn(tableTd, 'whitespace-nowrap tabular-nums', m.deleted ? 'text-danger-ink' : 'text-ink-5')}>{m.deletedAt || '-'}</td>
                  <td className={cn(tableTd, 'pr-5 text-right')}>
                    <button
                      type="button"
                      aria-label={`${m.name} ${t.edit}`}
                      title={`${m.name} ${t.edit}`}
                      onClick={() => setEditing(m)}
                      className="inline-flex size-[30px] items-center justify-center rounded-ctl bg-primary text-white hover:brightness-105"
                    >
                      <EditIcon size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <MemberEditModal
          lawsuitId={lawsuitId}
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
          members={members}
          onClose={() => setAdding(false)}
          onSave={(member, ticket) => {
            onAdd(member, ticket)
            setAdding(false)
          }}
        />
      )}
    </section>
  )
}
