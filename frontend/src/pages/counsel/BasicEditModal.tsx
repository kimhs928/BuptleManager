import { useState } from 'react'
import { EditModal, Field, FieldGroup, Select, TextInput } from '../../components/ui'
import type { Change } from '../../components/ui'
import { formatDateTime } from '../../lib/date'
import { COUNSEL_STATUSES } from '../../mocks/counsel'
import type { CounselDetail, CounselStatus } from '../../mocks/counsel'
import { texts } from '../../texts'
import { makeAudit } from '../contract/audit'

const t = texts.counsel.basicEdit

type Props = {
  counsel: CounselDetail
  onClose: () => void
  onSave: (next: CounselDetail, changeCount: number, ticket: string) => void
}

/** 자문 기본 정보 수정 */
export function BasicEditModal({ counsel, onClose, onSave }: Props) {
  const [form, setForm] = useState<CounselDetail>(counsel)
  const [ticket, setTicket] = useState('')
  const [reason, setReason] = useState('')
  const [openedAt] = useState(() => formatDateTime())

  const set = <K extends keyof CounselDetail>(key: K, value: CounselDetail[K]) => setForm((f) => ({ ...f, [key]: value }))
  const deletedText = (v: boolean) => t.deletedOptions[String(v) as 'true' | 'false']

  const changes: Change[] = []
  if (form.status !== counsel.status) changes.push({ field: t.fields.status, before: counsel.status, after: form.status })
  if (form.name !== counsel.name) changes.push({ field: t.fields.name, before: counsel.name, after: form.name })
  if (form.createdAt !== counsel.createdAt) changes.push({ field: t.fields.createdAt, before: counsel.createdAt, after: form.createdAt })
  if (form.updatedAt !== counsel.updatedAt) changes.push({ field: t.fields.updatedAt, before: counsel.updatedAt, after: form.updatedAt })
  if (form.deleted !== counsel.deleted) changes.push({ field: t.fields.deleted, before: deletedText(counsel.deleted), after: deletedText(form.deleted) })

  const save = () => {
    // 수정일을 직접 바꾸지 않았다면 저장 시각으로 갱신하고, 삭제 상태가 바뀌면 삭제일도 맞춘다
    const now = formatDateTime()
    const next: CounselDetail = {
      ...form,
      updatedAt: form.updatedAt !== counsel.updatedAt ? form.updatedAt : now,
      deletedAt: form.deleted === counsel.deleted ? form.deletedAt : form.deleted ? now : '',
    }
    onSave(next, changes.length, ticket.trim())
  }

  return (
    <EditModal
      title={t.title}
      description={t.description(counsel.id)}
      saveLabel="실행"
      changes={changes}
      canSubmit={form.name.trim() !== '' && form.createdAt !== '' && form.updatedAt !== ''}
      audit={makeAudit(t.action, openedAt)}
      ticket={ticket}
      onTicketChange={setTicket}
      reason={reason}
      onReasonChange={setReason}
      onClose={onClose}
      onSave={save}
    >
      <FieldGroup title={t.groups.info}>
        <Field label={t.fields.id} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={counsel.id} />}
        </Field>
        <Field label={t.fields.status} required>
          {(id) => (
            <Select id={id} value={form.status} onChange={(e) => set('status', e.target.value as CounselStatus)}>
              {COUNSEL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label={t.fields.name} required className="col-span-2">
          {(id) => <TextInput id={id} value={form.name} onChange={(e) => set('name', e.target.value)} />}
        </Field>
      </FieldGroup>

      <FieldGroup title={t.groups.dates}>
        <Field label={t.fields.createdAt}>
          {(id) => <TextInput id={id} type="datetime-local" value={form.createdAt.replace(' ', 'T')} onChange={(e) => set('createdAt', e.target.value.replace('T', ' '))} />}
        </Field>
        <Field label={t.fields.updatedAt}>
          {(id) => <TextInput id={id} type="datetime-local" value={form.updatedAt.replace(' ', 'T')} onChange={(e) => set('updatedAt', e.target.value.replace('T', ' '))} />}
        </Field>
      </FieldGroup>

      <FieldGroup title={t.groups.deleted} columns={1}>
        <Field label={t.fields.deleted} required>
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
