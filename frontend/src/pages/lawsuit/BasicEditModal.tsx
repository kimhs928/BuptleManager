import { useState } from 'react'
import { EditModal, Field, FieldGroup, Select, Textarea, TextInput } from '../../components/ui'
import type { Change } from '../../components/ui'
import { formatDateTime } from '../../lib/date'
import { LAWSUIT_STATUS_INFO, LAWSUIT_STATUSES } from '../../mocks/lawsuit'
import type { LawsuitDetail, LawsuitStatus } from '../../mocks/lawsuit'
import { texts } from '../../texts'
import { makeAudit } from '../contract/audit'

const t = texts.lawsuit.basicEdit

type Props = {
  lawsuit: LawsuitDetail
  onClose: () => void
  onSave: (next: LawsuitDetail, changeCount: number, ticket: string) => void
}

/** 소송 상세 정보 수정 */
export function BasicEditModal({ lawsuit, onClose, onSave }: Props) {
  const [form, setForm] = useState<LawsuitDetail>(lawsuit)
  const [ticket, setTicket] = useState('')
  const [reason, setReason] = useState('')
  const [openedAt] = useState(() => formatDateTime())

  const set = <K extends keyof LawsuitDetail>(key: K, value: LawsuitDetail[K]) => setForm((f) => ({ ...f, [key]: value }))
  const deletedText = (v: boolean) => t.deletedOptions[String(v) as 'true' | 'false']
  const l = t.changeLabels

  const changes: Change[] = []
  if (form.name !== lawsuit.name) changes.push({ field: l.name, before: lawsuit.name, after: form.name })
  if (form.desc !== lawsuit.desc) changes.push({ field: l.desc, before: lawsuit.desc || '-', after: form.desc || '-' })
  if (form.amount !== lawsuit.amount) changes.push({ field: l.amount, before: texts.lawsuit.won(lawsuit.amount), after: texts.lawsuit.won(form.amount) })
  if (form.status !== lawsuit.status) changes.push({ field: l.status, before: LAWSUIT_STATUS_INFO[lawsuit.status].label, after: LAWSUIT_STATUS_INFO[form.status].label })
  if (form.deleted !== lawsuit.deleted) changes.push({ field: l.deleted, before: deletedText(lawsuit.deleted), after: deletedText(form.deleted) })

  return (
    <EditModal
      title={t.title}
      description={t.description(lawsuit.id)}
      saveLabel="실행"
      changes={changes}
      canSubmit={form.name.trim() !== ''}
      audit={makeAudit(t.action, openedAt)}
      ticket={ticket}
      onTicketChange={setTicket}
      reason={reason}
      onReasonChange={setReason}
      onClose={onClose}
      // 수정일은 저장 시각으로 갱신한다
      onSave={() => onSave({ ...form, updatedAt: formatDateTime() }, changes.length, ticket.trim())}
    >
      <FieldGroup title={t.groups.info} columns={1}>
        <Field label={t.fields.name} required>
          {(id) => <TextInput id={id} value={form.name} onChange={(e) => set('name', e.target.value)} />}
        </Field>
        <Field label={t.fields.desc}>{(id) => <Textarea id={id} rows={3} value={form.desc} onChange={(e) => set('desc', e.target.value)} />}</Field>
      </FieldGroup>

      <FieldGroup title={t.groups.amount} columns={1}>
        <Field label={t.fields.amount} required>
          {(id) => <TextInput id={id} type="number" min={0} value={form.amount} onChange={(e) => set('amount', Number(e.target.value))} />}
        </Field>
      </FieldGroup>

      <FieldGroup title={t.groups.state}>
        <Field label={t.fields.status} required>
          {(id) => (
            <Select id={id} value={form.status} onChange={(e) => set('status', e.target.value as LawsuitStatus)}>
              {LAWSUIT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {LAWSUIT_STATUS_INFO[s].label}
                </option>
              ))}
            </Select>
          )}
        </Field>
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
