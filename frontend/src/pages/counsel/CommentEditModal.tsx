import { useState } from 'react'
import { EditModal, Field, FieldGroup, Select, Textarea, TextInput } from '../../components/ui'
import type { Change } from '../../components/ui'
import { formatDateTime } from '../../lib/date'
import type { CounselComment } from '../../mocks/counsel'
import { texts } from '../../texts'
import { makeAudit } from '../contract/audit'

const t = texts.counsel.commentEdit

type Props = {
  counselId: string
  comment: CounselComment
  onClose: () => void
  onSave: (next: CounselComment, ticket: string) => void
}

/** 자문 코멘트 수정. 내용과 삭제 유무만 바꿀 수 있다 */
export function CommentEditModal({ counselId, comment, onClose, onSave }: Props) {
  const [text, setText] = useState(comment.text)
  const [deleted, setDeleted] = useState(comment.deleted)
  const [ticket, setTicket] = useState('')
  const [reason, setReason] = useState('')
  const [openedAt] = useState(() => formatDateTime())

  const deletedText = (v: boolean) => t.deletedOptions[String(v) as 'true' | 'false']
  const changes: Change[] = []
  if (text !== comment.text) changes.push({ field: t.fields.text, before: comment.text, after: text })
  if (deleted !== comment.deleted) changes.push({ field: t.fields.deleted, before: deletedText(comment.deleted), after: deletedText(deleted) })

  const save = () => {
    // 수정일은 저장 시각으로 갱신하고, 삭제 상태가 바뀌면 삭제일도 맞춘다
    const now = formatDateTime()
    onSave({ ...comment, text, deleted, updatedAt: now, deletedAt: deleted === comment.deleted ? comment.deletedAt : deleted ? now : '' }, ticket.trim())
  }

  return (
    <EditModal
      title={t.title}
      description={t.description(counselId)}
      saveLabel="실행"
      changes={changes}
      canSubmit={text.trim() !== ''}
      audit={makeAudit(t.action, openedAt)}
      ticket={ticket}
      onTicketChange={setTicket}
      reason={reason}
      onReasonChange={setReason}
      onClose={onClose}
      onSave={save}
    >
      <FieldGroup title={t.groups.info}>
        <Field label={t.fields.author} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={comment.author} />}
        </Field>
        <Field label={t.fields.type} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={comment.type} />}
        </Field>
        <Field label={t.fields.at} readOnlyHint className="col-span-2">
          {(id) => <TextInput id={id} readOnly value={comment.at} />}
        </Field>
      </FieldGroup>

      <FieldGroup title={t.groups.comment} columns={1}>
        <Field label={t.fields.text} required>
          {(id) => <Textarea id={id} rows={4} value={text} onChange={(e) => setText(e.target.value)} />}
        </Field>
      </FieldGroup>

      <FieldGroup title={t.groups.deleted}>
        <Field label={t.fields.deleted} required>
          {(id) => (
            <Select id={id} value={String(deleted)} onChange={(e) => setDeleted(e.target.value === 'true')}>
              <option value="false">{t.deletedOptions.false}</option>
              <option value="true">{t.deletedOptions.true}</option>
            </Select>
          )}
        </Field>
        <Field label={`${t.fields.updatedAt} · ${t.autoUpdate}`} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={comment.updatedAt} />}
        </Field>
      </FieldGroup>
    </EditModal>
  )
}
