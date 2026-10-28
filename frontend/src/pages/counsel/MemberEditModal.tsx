import { useState } from 'react'
import { CheckGroup, EditModal, Field, FieldGroup, GroupField, Select, TextInput } from '../../components/ui'
import type { Change } from '../../components/ui'
import { formatDateTime } from '../../lib/date'
import { COUNSEL_ROLES, INTERNAL_COUNSEL_ROLES } from '../../mocks/counsel'
import type { CounselMember } from '../../mocks/counsel'
import { texts } from '../../texts'
import { makeAudit } from '../contract/audit'
import { stamp } from '../contract/memberStamp'
import { joinList } from '../contract/format'

const t = texts.counsel.memberEdit

type Props = {
  counselId: string
  member: CounselMember
  onClose: () => void
  onSave: (next: CounselMember, ticket: string) => void
}

/** 자문 참여 유저 수정 */
export function MemberEditModal({ counselId, member, onClose, onSave }: Props) {
  const [form, setForm] = useState<CounselMember>(member)
  const [ticket, setTicket] = useState('')
  const [reason, setReason] = useState('')
  const [openedAt] = useState(() => formatDateTime())

  const set = <K extends keyof CounselMember>(key: K, value: CounselMember[K]) => setForm((f) => ({ ...f, [key]: value }))
  const deletedText = (v: boolean) => t.deletedOptions[String(v) as 'true' | 'false']

  const changes: Change[] = []
  if (form.company !== member.company) changes.push({ field: t.fields.company, before: member.company, after: form.company })
  if (form.phone !== member.phone) changes.push({ field: t.fields.phone, before: member.phone, after: form.phone })
  if (form.dept !== member.dept) changes.push({ field: t.fields.dept, before: member.dept, after: form.dept })
  if (joinList(form.roles, texts.counsel.none) !== joinList(member.roles, texts.counsel.none)) {
    changes.push({ field: t.fields.roles, before: joinList(member.roles, texts.counsel.none), after: joinList(form.roles, texts.counsel.none) })
  }
  if (form.deleted !== member.deleted) changes.push({ field: t.fields.deleted, before: deletedText(member.deleted), after: deletedText(form.deleted) })

  return (
    <EditModal
      title={t.title(member.name)}
      description={t.description(counselId)}
      saveLabel="실행"
      changes={changes}
      audit={makeAudit(t.action, openedAt)}
      ticket={ticket}
      onTicketChange={setTicket}
      reason={reason}
      onReasonChange={setReason}
      onClose={onClose}
      onSave={() => onSave({ ...form, ...stamp(member, form.deleted) }, ticket.trim())}
    >
      <FieldGroup title={t.groups.info}>
        <Field label={t.fields.name} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={member.name} />}
        </Field>
        <Field label={t.fields.email} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={member.email} />}
        </Field>
        <Field label={t.fields.kind} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={texts.counsel.members.kind[member.userId ? 'internal' : 'external']} />}
        </Field>
        <Field label={t.fields.sysRoles} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={member.userId && member.sysRoles.length > 0 ? member.sysRoles.join(', ') : '-'} />}
        </Field>
        <Field label={t.fields.approvalType} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={member.approvalType || '-'} />}
        </Field>
        <Field label={t.fields.approvalStatus} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={member.approvalStatus || '-'} />}
        </Field>
        <Field label={t.fields.company}>{(id) => <TextInput id={id} value={form.company} onChange={(e) => set('company', e.target.value)} />}</Field>
        <Field label={t.fields.phone}>{(id) => <TextInput id={id} type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} />}</Field>
        <Field label={t.fields.dept}>{(id) => <TextInput id={id} value={form.dept} onChange={(e) => set('dept', e.target.value)} />}</Field>
      </FieldGroup>

      <FieldGroup title={t.groups.roles} columns={1}>
        <GroupField label={t.fields.roles} hint={t.rolesNote}>
          <CheckGroup label={t.fields.roles} options={member.userId ? INTERNAL_COUNSEL_ROLES : COUNSEL_ROLES} value={form.roles} onChange={(v) => set('roles', v)} />
        </GroupField>
      </FieldGroup>

      <FieldGroup title={t.groups.deleted} columns={1}>
        <Field label={t.fields.deleted}>
          {(id) => (
            <Select id={id} value={String(form.deleted)} onChange={(e) => set('deleted', e.target.value === 'true')}>
              <option value="false">{t.deletedOptions.false}</option>
              <option value="true">{t.deletedOptions.true}</option>
            </Select>
          )}
        </Field>
      </FieldGroup>
    </EditModal>
  )
}
