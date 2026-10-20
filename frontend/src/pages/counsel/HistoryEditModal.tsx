import { useState } from 'react'
import { EditModal, Field, FieldGroup, Select, Textarea, TextInput } from '../../components/ui'
import type { Change } from '../../components/ui'
import { formatDateTime } from '../../lib/date'
import type { CounselHistoryRow } from '../../mocks/counsel'
import { texts } from '../../texts'
import { makeAudit } from '../contract/audit'

const t = texts.counsel.historyEdit

type Props = {
  row: CounselHistoryRow
  /** 선택할 수 있는 액션 유저 (자문 참여 유저) */
  users: string[]
  onClose: () => void
  onSave: (next: CounselHistoryRow, changedFields: string[], ticket: string) => void
}

/** 자문 히스토리 액션 수정 */
export function HistoryEditModal({ row, users, onClose, onSave }: Props) {
  const [user, setUser] = useState(row.user)
  const [at, setAt] = useState(row.at.replace(' ', 'T'))
  const [deleted, setDeleted] = useState<'Y' | 'N'>(row.deleted ? 'Y' : 'N')
  const [comment, setComment] = useState(row.comment)
  const [ticket, setTicket] = useState('')
  const [reason, setReason] = useState('')
  const [openedAt] = useState(() => formatDateTime())

  const f = t.fields
  const changes: Change[] = []
  if (user !== row.user) changes.push({ field: f.user, before: row.user, after: user })
  if (at && at.replace('T', ' ') !== row.at) changes.push({ field: f.at, before: row.at, after: at.replace('T', ' ') })
  if ((deleted === 'Y') !== row.deleted) changes.push({ field: f.deleted, before: row.deleted ? 'Y' : 'N', after: deleted })
  if (comment !== row.comment) changes.push({ field: f.comment, before: row.comment, after: comment || t.emptyComment })

  const userOptions = users.includes(row.user) ? users : [row.user, ...users]

  return (
    <EditModal
      title={t.title}
      description={t.description}
      saveLabel="실행"
      changes={changes}
      canSubmit={at !== ''}
      audit={makeAudit(t.action, openedAt)}
      ticket={ticket}
      onTicketChange={setTicket}
      reason={reason}
      onReasonChange={setReason}
      onClose={onClose}
      onSave={() => onSave({ ...row, user, at: at.replace('T', ' '), deleted: deleted === 'Y', comment }, changes.map((c) => c.field), ticket.trim())}
    >
      <FieldGroup title={t.groups.info}>
        <Field label={f.type} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={row.action} />}
        </Field>
        <Field label={f.move} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={`${row.from} → ${row.to}`} />}
        </Field>
      </FieldGroup>

      <FieldGroup title={t.groups.edit}>
        <Field label={f.user} hint={t.userHint}>
          {(id) => (
            <Select id={id} value={user} onChange={(e) => setUser(e.target.value)}>
              {userOptions.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label={f.at}>{(id) => <TextInput id={id} type="datetime-local" value={at} onChange={(e) => setAt(e.target.value)} />}</Field>
        <Field label={f.deleted}>
          {(id) => (
            <Select id={id} value={deleted} onChange={(e) => setDeleted(e.target.value as 'Y' | 'N')}>
              <option value="N">{t.deletedOptions.N}</option>
              <option value="Y">{t.deletedOptions.Y}</option>
            </Select>
          )}
        </Field>
        <Field label={f.comment} className="col-span-2">
          {(id) => <Textarea id={id} rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />}
        </Field>
      </FieldGroup>
    </EditModal>
  )
}
