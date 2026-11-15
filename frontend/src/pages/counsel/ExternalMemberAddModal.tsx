import { useState } from 'react'
import { CheckGroup, EditModal, Field, FieldGroup, GroupField, TextInput } from '../../components/ui'
import type { Change } from '../../components/ui'
import { formatDateTime } from '../../lib/date'
import { useEnumLabels } from '../../hooks/useEnumLabels'
import type { CounselMember } from '../../mocks/counsel'
import { texts } from '../../texts'
import { makeAudit } from '../contract/audit'
import { joinList } from '../contract/format'

const t = texts.counsel.memberAdd
const e = t.external

type Props = {
  /** 이미 참여 중인 유저 (삭제된 유저 포함) */
  members: CounselMember[]
  onClose: () => void
  onSave: (member: CounselMember, ticket: string) => void
}

/** 자문 외부 유저 추가. 사내 유저가 아니라 user_id 없이 이름, 이메일, 회사 정보를 직접 입력한다 */
export function ExternalMemberAddModal({ members, onClose, onSave }: Props) {
  const [form, setForm] = useState({ name: '', email: '', company: '', dept: '', phone: '' })
  const [roles, setRoles] = useState<string[]>([])
  // 역할 선택지와 이름은 enum 표(DB)에서 읽는다
  const roleOptions = useEnumLabels('BIZ_COUNSEL_PARTICIPANT_ROLE').options.map((o) => o.label)
  const [ticket, setTicket] = useState('')
  const [reason, setReason] = useState('')
  const [openedAt] = useState(() => formatDateTime())

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }))
  const name = form.name.trim()
  const email = form.email.trim()

  const taken = email ? members.find((m) => m.email.toLowerCase() === email.toLowerCase()) : undefined
  const canSubmit = name !== '' && email !== '' && !taken && roles.length > 0

  // 추가 모달은 변경 항목이 하나뿐이라, 되돌리면 입력을 모두 비운다
  const resetAll = () => {
    setForm({ name: '', email: '', company: '', dept: '', phone: '' })
    setRoles([])
  }

  const changes: Change[] = canSubmit ? [{ field: e.change, after: `${name} (${email}) · ${joinList(roles, t.noRole)}`, reset: resetAll }] : []

  const save = () => {
    const now = formatDateTime()
    onSave(
      {
        id: `ext-${Date.now()}`,
        name,
        email,
        company: form.company.trim(),
        phone: form.phone.trim(),
        roles,
        dept: form.dept.trim(),
        sysRoles: [],
        approvalType: '',
        approvalStatus: '',
        deleted: false,
        createdAt: now,
        updatedAt: now,
        deletedAt: '',
      },
      ticket.trim(),
    )
  }

  return (
    <EditModal
      title={e.title}
      description={e.description}
      saveLabel={t.save}
      changes={changes}
      onResetAll={resetAll}
      canSubmit={canSubmit}
      audit={makeAudit(e.action, openedAt)}
      ticket={ticket}
      onTicketChange={setTicket}
      reason={reason}
      onReasonChange={setReason}
      onClose={onClose}
      onSave={save}
    >
      <FieldGroup title={e.groups.info}>
        <Field label={e.fields.name} required>
          {(id) => <TextInput id={id} autoComplete="off" value={form.name} onChange={(ev) => set('name', ev.target.value)} />}
        </Field>
        <Field label={e.fields.email} required hint={taken ? (taken.deleted ? e.dupDeleted : e.dup) : undefined}>
          {(id) => <TextInput id={id} type="email" autoComplete="off" placeholder={e.emailPlaceholder} value={form.email} onChange={(ev) => set('email', ev.target.value)} />}
        </Field>
        <Field label={e.fields.company}>
          {(id) => <TextInput id={id} autoComplete="off" value={form.company} onChange={(ev) => set('company', ev.target.value)} />}
        </Field>
        <Field label={e.fields.dept}>
          {(id) => <TextInput id={id} autoComplete="off" value={form.dept} onChange={(ev) => set('dept', ev.target.value)} />}
        </Field>
        <Field label={e.fields.phone} className="col-span-2">
          {(id) => <TextInput id={id} autoComplete="off" placeholder={e.phonePlaceholder} value={form.phone} onChange={(ev) => set('phone', ev.target.value)} />}
        </Field>
      </FieldGroup>

      <FieldGroup title={t.groups.setting} columns={1}>
        <GroupField label={t.rolesLabel} hint={t.rolesNote} required>
          <CheckGroup label={t.rolesLabel} options={roleOptions} value={roles} onChange={setRoles} />
        </GroupField>
        <span className="text-xs text-ink-4">{t.activeNote}</span>
      </FieldGroup>
    </EditModal>
  )
}
