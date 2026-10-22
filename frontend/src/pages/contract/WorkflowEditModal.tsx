import { useState } from 'react'
import { CheckGroup, GroupField, EditModal, Field, FieldGroup, TextInput } from '../../components/ui'
import type { Change } from '../../components/ui'
import { formatDateTime } from '../../lib/date'
import type { Workflow } from '../../mocks/contract'
import { texts } from '../../texts'
import { makeAudit } from './audit'
import { joinList } from './format'

const t = texts.contract.workflowEdit

type Props = {
  workflow: Workflow
  onClose: () => void
  onSave: (next: Workflow, changeCount: number, ticket: string) => void
}

/** 워크플로우 변경 */
export function WorkflowEditModal({ workflow, onClose, onSave }: Props) {
  const [form, setForm] = useState<Workflow>(workflow)
  const [ticket, setTicket] = useState('')
  const [reason, setReason] = useState('')
  const [openedAt] = useState(() => formatDateTime())

  const none = texts.contract.empty
  const changes: Change[] = []
  form.attrs.forEach((a, i) => {
    const before = workflow.attrs[i]
    if (joinList(a.value, none) !== joinList(before.value, none)) changes.push({ field: a.label, before: joinList(before.value, none), after: joinList(a.value, none) })
  })

  const setAttr = (key: string, value: string[]) => setForm((f) => ({ ...f, attrs: f.attrs.map((a) => (a.key === key ? { ...a, value } : a)) }))

  return (
    <EditModal
      title={t.title}
      description={t.description('CT-2024-0315')}
      saveLabel="실행"
      changes={changes}
      canSubmit
      audit={makeAudit(t.action, openedAt)}
      ticket={ticket}
      onTicketChange={setTicket}
      reason={reason}
      onReasonChange={setReason}
      onClose={onClose}
      onSave={() => onSave(form, changes.length, ticket.trim())}
    >
      <FieldGroup title={t.groups.workflow}>
        <Field label={t.fields.name} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={form.name} />}
        </Field>
        <Field label={t.fields.rev} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={form.rev} />}
        </Field>
      </FieldGroup>

      <FieldGroup title={t.groups.shape}>
        {form.attrs.map((a) => (
          <GroupField key={a.key} label={a.label} hint={a.type === 'multi' ? t.hintMulti : t.hintSingle}>
            <CheckGroup
              label={a.label}
              options={a.options}
              value={a.value}
              // 단일 선택 항목은 누른 값 하나만 남긴다
              onChange={(next, toggled) => setAttr(a.key, a.type === 'multi' ? next : [toggled])}
            />
          </GroupField>
        ))}
      </FieldGroup>
    </EditModal>
  )
}
