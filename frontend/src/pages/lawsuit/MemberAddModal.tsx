import { useState } from 'react'
import { CheckIcon, CloseIcon } from '../../components/icons'
import { CheckGroup, EditModal, Field, FieldGroup, GroupField, TextInput } from '../../components/ui'
import type { Change } from '../../components/ui'
import { cn } from '../../lib/cn'
import { formatDateTime } from '../../lib/date'
import { LAWSUIT_ROLES, MOCK_LAWSUIT_DIRECTORY } from '../../mocks/lawsuit'
import type { LawsuitMember } from '../../mocks/lawsuit'
import { texts } from '../../texts'
import { makeAudit } from '../contract/audit'
import { joinList } from '../contract/format'

const t = texts.lawsuit.memberAdd

type Match = 'idle' | 'ok' | 'bad' | 'joined' | 'deletedJoined'

const matchTone: Record<Match, string> = {
  idle: 'border-line-strong bg-[#f2f2f5] text-ink',
  ok: 'border-success-line bg-success-soft text-success-ink',
  bad: 'border-danger-line bg-danger-soft text-danger-ink',
  joined: 'border-danger-line bg-danger-soft text-danger-ink',
  deletedJoined: 'border-danger-line bg-danger-soft text-danger-ink',
}

type Props = {
  /** 이미 참여 중인 유저 (삭제된 유저 포함) */
  members: LawsuitMember[]
  onClose: () => void
  onSave: (member: LawsuitMember, ticket: string) => void
}

/** 소송 참여 유저 추가. 이름 · 이메일 · user_id가 사내 유저와 모두 일치해야 한다 */
export function MemberAddModal({ members, onClose, onSave }: Props) {
  const [form, setForm] = useState({ name: '', email: '', userId: '' })
  const [roles, setRoles] = useState<string[]>([])
  const [ticket, setTicket] = useState('')
  const [reason, setReason] = useState('')
  const [openedAt] = useState(() => formatDateTime())

  const name = form.name.trim()
  const email = form.email.trim()
  const userId = form.userId.trim()
  const filled = name !== '' && email !== '' && userId !== ''

  const hit = filled ? MOCK_LAWSUIT_DIRECTORY.find((d) => d.name === name && d.email.toLowerCase() === email.toLowerCase() && d.userId === userId) : undefined
  const taken = hit ? members.find((m) => m.email.toLowerCase() === hit.email.toLowerCase() || (!!m.userId && m.userId === hit.userId)) : undefined
  const selected = hit && !taken ? hit : undefined

  const match: Match = taken ? (taken.deleted ? 'deletedJoined' : 'joined') : selected ? 'ok' : filled ? 'bad' : 'idle'

  const changes: Change[] = selected ? [{ field: t.change, after: `${selected.name} (${selected.userId}) · ${joinList(roles, t.noRole)}` }] : []

  const save = () => {
    if (!selected) return
    onSave(
      {
        id: selected.userId,
        userId: selected.userId,
        name: selected.name,
        email: selected.email,
        company: selected.company,
        phone: selected.phone,
        roles,
        dept: selected.dept,
        deleted: false,
      },
      ticket.trim(),
    )
  }

  return (
    <EditModal
      title={t.title}
      description={t.description}
      saveLabel={t.save}
      changes={changes}
      canSubmit={!!selected && roles.length > 0}
      audit={makeAudit(t.action, openedAt)}
      ticket={ticket}
      onTicketChange={setTicket}
      reason={reason}
      onReasonChange={setReason}
      onClose={onClose}
      onSave={save}
    >
      <FieldGroup title={t.groups.info} columns={1}>
        <div role="status" className={cn('flex items-start gap-2.5 rounded-[10px] border px-3.5 py-3 text-[13px] leading-normal', matchTone[match])}>
          {match !== 'idle' && (
            <span aria-hidden="true" className="mt-px inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-current">
              {match === 'ok' ? <CheckIcon size={11} strokeWidth={3} className="text-white" /> : <CloseIcon size={11} strokeWidth={3} className="text-white" />}
            </span>
          )}
          <span>{t.match[match]}</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label={t.fields.name} required>
            {(id) => <TextInput id={id} autoComplete="off" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />}
          </Field>
          <Field label={t.fields.email} required>
            {(id) => <TextInput id={id} type="email" autoComplete="off" placeholder={t.emailPlaceholder} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />}
          </Field>
          <Field label={t.fields.userId} required>
            {(id) => <TextInput id={id} autoComplete="off" placeholder={t.userIdPlaceholder} value={form.userId} onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))} />}
          </Field>
        </div>
        {selected && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[10px] bg-[#f2f2f5] px-3.5 py-2.5 text-[13px]">
            <span className="text-xs font-semibold text-ink-4">{t.confirmed}</span>
            <span>
              {selected.company} · {selected.dept}
            </span>
            <span className="tabular-nums text-ink-3">{selected.phone}</span>
          </div>
        )}
      </FieldGroup>

      <FieldGroup title={t.groups.setting} columns={1}>
        <GroupField label={t.rolesLabel} hint={t.rolesNote} required>
          <CheckGroup label={t.rolesLabel} options={LAWSUIT_ROLES} value={roles} onChange={setRoles} />
        </GroupField>
        <span className="text-xs text-ink-4">{t.activeNote}</span>
      </FieldGroup>
    </EditModal>
  )
}
