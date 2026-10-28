import { useState } from 'react'
import { EditModal, Field, FieldGroup, Select, Textarea, TextInput } from '../../components/ui'
import type { Change } from '../../components/ui'
import { formatDateTime } from '../../lib/date'
import type { CounselComment, CounselReply } from '../../mocks/counsel'
import { texts } from '../../texts'
import { makeAudit } from '../contract/audit'

const t = texts.counsel.replyEdit

type Props = {
  counselId: string
  /** 이 댓글이 달린 코멘트 */
  comment: CounselComment
  reply: CounselReply
  onClose: () => void
  onSave: (next: CounselReply, ticket: string) => void
}

/** 자문 댓글 수정. 내용과 삭제 유무만 바꿀 수 있다 */
export function ReplyEditModal({ counselId, comment, reply, onClose, onSave }: Props) {
  const [text, setText] = useState(reply.text)
  const [deleted, setDeleted] = useState(reply.deleted)
  const [ticket, setTicket] = useState('')
  const [reason, setReason] = useState('')
  const [openedAt] = useState(() => formatDateTime())

  const deletedText = (v: boolean) => t.deletedOptions[String(v) as 'true' | 'false']
  const changes: Change[] = []
  if (text !== reply.text) changes.push({ field: t.fields.text, before: reply.text, after: text })
  if (deleted !== reply.deleted) changes.push({ field: t.fields.deleted, before: deletedText(reply.deleted), after: deletedText(deleted) })

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
      onSave={() => onSave({ ...reply, text, deleted }, ticket.trim())}
    >
      <FieldGroup title={t.groups.info}>
        <Field label={t.fields.author} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={reply.author} />}
        </Field>
        <Field label={t.fields.at} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={reply.at} />}
        </Field>
        <Field label={t.fields.target} readOnlyHint className="col-span-2">
          {(id) => <TextInput id={id} readOnly value={`${comment.type} · ${comment.author} · ${comment.text.slice(0, 40)}${comment.text.length > 40 ? '…' : ''}`} />}
        </Field>
      </FieldGroup>

      <FieldGroup title={t.groups.reply} columns={1}>
        <Field label={t.fields.text} required>
          {(id) => <Textarea id={id} rows={4} value={text} onChange={(e) => setText(e.target.value)} />}
        </Field>
      </FieldGroup>

      <FieldGroup title={t.groups.deleted} columns={1}>
        <Field label={t.fields.deleted} required>
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
