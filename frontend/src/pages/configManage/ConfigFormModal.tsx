import { useState } from 'react'
import { Alert, EditModal, Field, FieldGroup, Select, Textarea, TextInput } from '../../components/ui'
import type { Change } from '../../components/ui'
import { formatDateTime } from '../../lib/date'
import { MOCK_ACCOUNT } from '../../mocks/auth'
import type { HistoryCustomer } from '../../mocks/history'
import { texts } from '../../texts'
import { makeAudit } from '../contract/audit'
import type { ManagedRow, ManagedScope } from './types'

const t = texts.configManage.form
const typeLabel = texts.configManage.list.typeLabel

/** 값을 가지는 컨피그 타입 */
const HAS_VALUE: Record<ManagedScope, boolean> = { COMPONENT: false, MODULES: false, STANDALONE: true, PUBLIC: false }
const NAME_PATTERN = /^[A-Z0-9_.]+$/

type Props = {
  /** 수정할 컨피그. 없으면 새로 등록한다 */
  row?: ManagedRow
  /** 이미 적용된 컨피그 (중복 확인용) */
  existing: ManagedRow[]
  /** 등록할 수 있는 타입 */
  scopes: ManagedScope[]
  /** 선택할 수 있는 고객사 */
  customers: HistoryCustomer[]
  /** 고객사를 바꿀 수 없을 때(고객사를 선택한 상태) 고정할 고객사 ID */
  fixedCustomerId?: string
  /** 새로 등록할 때 미리 선택해 둘 고객사 ID */
  defaultCustomerId?: string
  onClose: () => void
  onSave: (next: ManagedRow, changeCount: number, ticket: string) => void
}

/** 컨피그 등록 · 수정 */
export function ConfigFormModal({ row, existing, scopes, customers, fixedCustomerId, defaultCustomerId, onClose, onSave }: Props) {
  const editing = !!row
  const [scope, setScope] = useState<ManagedScope>(row?.scope ?? scopes[0])
  const [customerId, setCustomerId] = useState(row?.customerId ?? fixedCustomerId ?? defaultCustomerId ?? '')
  const [name, setName] = useState(row?.name ?? '')
  const [value, setValue] = useState(row?.value ?? '')
  const [description, setDescription] = useState(row?.description ?? '')
  const [ticket, setTicket] = useState('')
  const [reason, setReason] = useState('')
  const [openedAt] = useState(() => formatDateTime())

  const isPublic = scope === 'PUBLIC'
  const hasValue = HAS_VALUE[scope]
  const customer = customers.find((c) => c.id === customerId)
  const customerLocked = editing || fixedCustomerId !== undefined
  const trimmedName = name.trim()
  const nameInvalid = trimmedName !== '' && !NAME_PATTERN.test(trimmedName)
  // 같은 고객사(PUBLIC은 전체) 안에서 같은 타입에 같은 이름이 있으면 중복이다
  const duplicate = !editing && trimmedName !== '' && existing.some((r) => r.scope === scope && r.name === trimmedName && r.customerId === (isPublic ? '' : customerId))

  const changes: Change[] = []
  if (editing && row) {
    if (hasValue && value !== row.value) changes.push({ field: t.fields.value, before: row.value || t.noValue, after: value || t.noValue })
    if (description !== row.description) changes.push({ field: t.fields.description, before: row.description, after: description })
  } else if (trimmedName !== '') {
    changes.push({ field: t.fields.type, after: typeLabel[scope] })
    if (!isPublic && customer) changes.push({ field: t.fields.customer, after: customer.name })
    changes.push({ field: t.fields.name, after: trimmedName })
    if (hasValue && value.trim() !== '') changes.push({ field: t.fields.value, after: value })
    if (description.trim() !== '') changes.push({ field: t.fields.description, after: description })
  }

  const customerOk = isPublic || customerId !== ''
  const valid = editing
    ? description.trim() !== '' && (!hasValue || value.trim() !== '')
    : customerOk && trimmedName !== '' && !nameInvalid && !duplicate && description.trim() !== '' && (!hasValue || value.trim() !== '')

  const save = () => {
    const today = formatDateTime().slice(0, 10)
    onSave(
      {
        id: row?.id ?? `c${Date.now()}`,
        scope,
        customerId: isPublic ? '' : customerId,
        name: row?.name ?? trimmedName,
        description: description.trim(),
        value: hasValue ? value : '',
        appliedAt: today,
        appliedBy: MOCK_ACCOUNT.name,
      },
      editing ? changes.length : 1,
      ticket.trim(),
    )
  }

  const companyLabel = isPublic ? texts.configManage.scope.publicCompany : customer ? `${customer.name} · ${customer.code}` : '-'
  const audit = { ...makeAudit(editing ? t.editAction : t.addAction, openedAt), company: companyLabel }

  return (
    <EditModal
      title={editing && row ? t.editTitle(row.name) : t.addTitle}
      description={editing ? t.editDescription(companyLabel) : t.addDescription(companyLabel)}
      saveLabel={t.save}
      changes={changes}
      canSubmit={valid}
      audit={audit}
      ticket={ticket}
      onTicketChange={setTicket}
      reason={reason}
      onReasonChange={setReason}
      onClose={onClose}
      onSave={save}
    >
      <FieldGroup title={t.groups.info}>
        <Field label={t.fields.type} required={!editing} readOnlyHint={editing}>
          {(id) => (
            <Select id={id} disabled={editing} value={scope} onChange={(e) => setScope(e.target.value as ManagedScope)}>
              {(editing ? [scope] : scopes).map((s) => (
                <option key={s} value={s}>
                  {typeLabel[s]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        {!isPublic && (
          <Field label={t.fields.customer} required={!customerLocked} readOnlyHint={customerLocked}>
            {(id) => (
              <Select id={id} disabled={customerLocked} value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                {customerId === '' && <option value="">{t.customerPlaceholder}</option>}
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </Select>
            )}
          </Field>
        )}
        <Field label={t.fields.name} required={!editing} readOnlyHint={editing} hint={editing ? undefined : duplicate ? t.nameDuplicate : nameInvalid ? t.nameInvalid : t.nameHint} className="col-span-2">
          {(id) => (
            <TextInput
              id={id}
              readOnly={editing}
              autoComplete="off"
              placeholder={t.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              aria-invalid={nameInvalid || duplicate || undefined}
              className="font-mono"
            />
          )}
        </Field>
        <Field label={t.fields.appliedAt} readOnlyHint className="col-span-2" hint={t.appliedAuto}>
          {(id) => <TextInput id={id} readOnly value={`${openedAt.slice(0, 10)} · ${MOCK_ACCOUNT.name}`} />}
        </Field>
      </FieldGroup>

      <FieldGroup title={t.groups.value} columns={1}>
        {hasValue ? (
          <Field label={t.fields.value} required>
            {(id) => <Textarea id={id} rows={3} value={value} onChange={(e) => setValue(e.target.value)} placeholder={t.valuePlaceholder} className="font-mono text-xs" />}
          </Field>
        ) : (
          <Alert tone={isPublic ? 'warn' : 'info'}>{isPublic ? t.publicNote : t.valueOnlyStandalone}</Alert>
        )}
        <Field label={t.fields.description} required>
          {(id) => <Textarea id={id} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t.descriptionPlaceholder} />}
        </Field>
      </FieldGroup>
    </EditModal>
  )
}
