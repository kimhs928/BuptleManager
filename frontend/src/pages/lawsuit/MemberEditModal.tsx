import { useState } from 'react'
import { CheckGroup, EditModal, Field, FieldGroup, GroupField, Select, TextInput } from '../../components/ui'
import type { Change } from '../../components/ui'
import { formatDateTime } from '../../lib/date'
import { LAWSUIT_ROLES } from '../../mocks/lawsuit'
import type { LawsuitMember } from '../../mocks/lawsuit'
import { texts } from '../../texts'
import { makeAudit } from '../contract/audit'
import { stamp } from '../contract/memberStamp'
import { joinList } from '../contract/format'

const t = texts.lawsuit.memberEdit

type Props = {
  lawsuitId: string
  member: LawsuitMember
  onClose: () => void
  onSave: (next: LawsuitMember, ticket: string) => void
}

/** 소송 참여 유저 수정. 역할과 삭제 유무만 바꿀 수 있다 */
export function MemberEditModal({ lawsuitId, member, onClose, onSave }: Props) {
  const [roles, setRoles] = useState<string[]>(member.roles)
  const [deleted, setDeleted] = useState(member.deleted)
  const [ticket, setTicket] = useState('')
  const [reason, setReason] = useState('')
  const [openedAt] = useState(() => formatDateTime())

  const none = texts.lawsuit.none
  const deletedText = (v: boolean) => t.deletedOptions[String(v) as 'true' | 'false']

  const changes: Change[] = []
  if (joinList(roles, none) !== joinList(member.roles, none)) changes.push({ field: t.fields.roles, before: joinList(member.roles, none), after: joinList(roles, none) })
  if (deleted !== member.deleted) changes.push({ field: t.fields.deleted, before: deletedText(member.deleted), after: deletedText(deleted) })

  return (
    <EditModal
      title={t.title(member.name)}
      description={t.description(lawsuitId)}
      saveLabel="실행"
      changes={changes}
      audit={makeAudit(t.action, openedAt)}
      ticket={ticket}
      onTicketChange={setTicket}
      reason={reason}
      onReasonChange={setReason}
      onClose={onClose}
      onSave={() => onSave({ ...member, roles, deleted, ...stamp(member, deleted) }, ticket.trim())}
    >
      <FieldGroup title={t.groups.info}>
        <Field label={t.fields.name} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={member.name} />}
        </Field>
        <Field label={t.fields.email} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={member.email} />}
        </Field>
        <Field label={t.fields.org} readOnlyHint className="col-span-2">
          {(id) => <TextInput id={id} readOnly value={`${member.company} · ${member.dept}`} />}
        </Field>
      </FieldGroup>

      <FieldGroup title={t.groups.roles} columns={1}>
        <GroupField label={t.fields.roles} hint={t.rolesNote}>
          <CheckGroup label={t.fields.roles} options={LAWSUIT_ROLES} value={roles} onChange={setRoles} />
        </GroupField>
      </FieldGroup>

      <FieldGroup title={t.groups.deleted} columns={1}>
        <Field label={t.fields.deleted}>
          {(id) => (
            <Select id={id} value={String(deleted)} onChange={(e) => setDeleted(e.target.value === 'true')}>
              <option value="false">{t.deletedOptions.false}</option>
              <option value="true">{t.deletedOptions.true}</option>
            </Select>
          )}
        </Field>
      </FieldGroup>
    </EditModal>
  )
}
