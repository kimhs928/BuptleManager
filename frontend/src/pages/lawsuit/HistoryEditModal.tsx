import { useState } from 'react'
import { EditModal, Field, FieldGroup, Select, TextInput } from '../../components/ui'
import type { Change } from '../../components/ui'
import { formatDateTime } from '../../lib/date'
import type { LawsuitHistoryRow } from '../../mocks/lawsuit'
import { texts } from '../../texts'
import { makeAudit } from '../contract/audit'

const t = texts.lawsuit.historyEdit

type Props = {
  row: LawsuitHistoryRow
  onClose: () => void
  onSave: (next: LawsuitHistoryRow, ticket: string) => void
}

/** 소송 히스토리 수정. 삭제 유무만 바꿀 수 있다 */
export function HistoryEditModal({ row, onClose, onSave }: Props) {
  const [deleted, setDeleted] = useState<'Y' | 'N'>(row.deleted ? 'Y' : 'N')
  const [ticket, setTicket] = useState('')
  const [reason, setReason] = useState('')
  const [openedAt] = useState(() => formatDateTime())

  const f = t.fields
  const changes: Change[] = []
  if ((deleted === 'Y') !== row.deleted) changes.push({ field: f.deleted, before: row.deleted ? 'Y' : 'N', after: deleted })

  const save = () => {
    const nextDeleted = deleted === 'Y'
    // 삭제로 바꾸면 삭제일을 지금으로, 삭제를 풀면 비운다
    const deletedAt = nextDeleted ? (row.deleted ? row.deletedAt : formatDateTime()) : ''
    onSave({ ...row, deleted: nextDeleted, deletedAt }, ticket.trim())
  }

  return (
    <EditModal
      title={t.title}
      description={t.description}
      saveLabel="실행"
      changes={changes}
      canSubmit
      audit={makeAudit(t.action, openedAt)}
      ticket={ticket}
      onTicketChange={setTicket}
      reason={reason}
      onReasonChange={setReason}
      onClose={onClose}
      onSave={save}
    >
      <FieldGroup title={t.groups.info}>
        <Field label={f.type} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={`${row.actionType} · ${row.actionText}`} />}
        </Field>
        <Field label={f.at} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={row.createdAt} />}
        </Field>
        <Field label={f.sender} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={row.name} />}
        </Field>
        <Field label={f.subject} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={row.subject} />}
        </Field>
      </FieldGroup>

      <FieldGroup title={t.groups.edit} columns={1}>
        <Field label={f.deleted}>
          {(id) => (
            <Select id={id} value={deleted} onChange={(e) => setDeleted(e.target.value as 'Y' | 'N')}>
              <option value="N">{t.deletedOptions.N}</option>
              <option value="Y">{t.deletedOptions.Y}</option>
            </Select>
          )}
        </Field>
      </FieldGroup>
    </EditModal>
  )
}
