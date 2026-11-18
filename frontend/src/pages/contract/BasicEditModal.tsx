import { useState } from 'react'
import { Alert, EditModal, Field, FieldGroup, RichTextEditor, Select, TextInput } from '../../components/ui'
import type { Change } from '../../components/ui'
import { formatDateTime } from '../../lib/date'
import { htmlToPlain } from '../../lib/safeHtml'
import type { EnumValue } from '../../lib/enums'
import type { ContractDetail } from '../../mocks/contract'
import { texts } from '../../texts'
import { makeAudit } from './audit'
import { ContractStatusSelect } from './ContractStatusSelect'
import { initialStatusCode } from './statusMap'
import type { Audit } from '../../lib/apiWrite'

const t = texts.contract.basicEdit

type EditKey = keyof typeof t.labels

/** 변경 전/후 비교에 쓰는 표시 값 */
function show(key: EditKey, c: ContractDetail): string {
  switch (key) {
    case 'createdAt':
    case 'updatedAt':
    case 'deletedAt':
      return c[key] ? c[key].replace('T', ' ') : '-'
    case 'autoRenew':
      return t.autoRenewOptions[String(c.autoRenew) as 'true' | 'false']
    case 'amount':
      return texts.contract.won(c.amount)
    case 'lang':
      return texts.contract.lang[c.lang]
    case 'deleted':
      return t.deletedOptions[String(c.deleted) as 'true' | 'false']
    case 'summary':
      return htmlToPlain(c.summary)
    default:
      return String(c[key])
  }
}

const keys = Object.keys(t.labels) as EditKey[]

type Props = {
  contract: ContractDetail
  onClose: () => void
  onSave: (next: ContractDetail, changeCount: number, audit: Audit) => void | Promise<void>
  /** 계약 종류·서명 방식 변경은 워크플로우 탭에서 한다 */
  onGoWorkflow: () => void
}

/** 계약 기본 정보 수정 */
export function BasicEditModal({ contract, onClose, onSave, onGoWorkflow }: Props) {
  const [form, setForm] = useState<ContractDetail>(contract)
  // 상태는 상태 코드로 고른다. 고른 상태의 이름은 변경 내용 표시에 쓴다
  const [statusCode, setStatusCode] = useState(() => initialStatusCode(contract))
  const [statusValue, setStatusValue] = useState<EnumValue | undefined>()
  const statusChanged = statusCode !== initialStatusCode(contract)
  const [ticket, setTicket] = useState('')
  const [reason, setReason] = useState('')
  const [openedAt] = useState(() => formatDateTime())

  const set = <K extends keyof ContractDetail>(key: K, value: ContractDetail[K]) => setForm((f) => ({ ...f, [key]: value }))

  const shown = (k: EditKey, c: ContractDetail) => (k === 'status' && c === form && statusChanged && statusValue ? `${statusValue.label} (${statusValue.code})` : show(k, c))
  // 상태는 코드와 분류도 같이 들고 있어서 함께 되돌린다
  const resetStatus = () => {
    setStatusCode(initialStatusCode(contract))
    setStatusValue(undefined)
  }
  const resetKey = (k: EditKey) => {
    setForm((f) => ({ ...f, [k]: contract[k], ...(k === 'status' ? { statusCode: contract.statusCode, statusGroup: contract.statusGroup } : {}) }))
    if (k === 'status') resetStatus()
  }
  const resetAll = () => {
    setForm(contract)
    resetStatus()
  }
  const changes: Change[] = keys
    .filter((k) => shown(k, form) !== shown(k, contract))
    .map((k) => ({ field: t.labels[k], before: shown(k, contract), after: shown(k, form), reset: () => resetKey(k) }))

  return (
    <EditModal
      title={t.title}
      saveLabel="실행"
      changes={changes}
      onResetAll={resetAll}
      audit={makeAudit(t.action, openedAt)}
      ticket={ticket}
      onTicketChange={setTicket}
      reason={reason}
      onReasonChange={setReason}
      onClose={onClose}
      onSave={(_at, requester) => onSave(form, changes.length, { ticket: ticket.trim(), requester, reason: reason.trim() })}
    >
      <FieldGroup title={t.groups.info}>
        <Field label={t.fields.id} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={form.id} />}
        </Field>
        <Field label={t.fields.status}>
          {(id) => (
            <ContractStatusSelect
              id={id}
              value={statusCode}
              onChange={(v) => {
                if (!v) return
                setStatusCode(v.code)
                setStatusValue(v)
                set('status', v.label)
                set('statusCode', v.code)
                set('statusGroup', v.groupCode)
              }}
            />
          )}
        </Field>
        <Field label={t.fields.name} className="col-span-2">
          {(id) => <TextInput id={id} value={form.name} onChange={(e) => set('name', e.target.value)} />}
        </Field>
        <Field label={t.fields.summary} className="col-span-2">
          {(id) => <RichTextEditor id={id} value={form.summary} onChange={(html) => set('summary', html)} />}
        </Field>
        <Field label={t.fields.amount}>
          {(id) => <TextInput id={id} type="number" min={0} value={form.amount} onChange={(e) => set('amount', Number(e.target.value) || 0)} />}
        </Field>
        <Field label={t.fields.lang}>
          {(id) => (
            <Select id={id} value={form.lang} onChange={(e) => set('lang', e.target.value as ContractDetail['lang'])}>
              {(Object.keys(texts.contract.lang) as ContractDetail['lang'][]).map((k) => (
                <option key={k} value={k}>
                  {texts.contract.lang[k]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label={t.fields.deleted}>
          {(id) => (
            <Select id={id} value={String(form.deleted)} onChange={(e) => set('deleted', e.target.value === 'true')}>
              <option value="false">{t.deletedOptions.false}</option>
              <option value="true">{t.deletedOptions.true}</option>
            </Select>
          )}
        </Field>
        <Field label={t.fields.migration} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={form.migration ? 'Y' : 'N'} />}
        </Field>
      </FieldGroup>

      <FieldGroup title={t.groups.dates}>
        <Field label={t.fields.startDate}>{(id) => <TextInput id={id} type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />}</Field>
        <Field label={t.fields.endDate}>{(id) => <TextInput id={id} type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />}</Field>
        <Field label={t.fields.createdAt}>
          {(id) => <TextInput id={id} type="datetime-local" value={form.createdAt} onChange={(e) => set('createdAt', e.target.value)} />}
        </Field>
        <Field label={t.fields.updatedAt}>
          {(id) => <TextInput id={id} type="datetime-local" value={form.updatedAt} onChange={(e) => set('updatedAt', e.target.value)} />}
        </Field>
        <Field label={t.fields.deletedAt}>
          {(id) => <TextInput id={id} type="datetime-local" value={form.deletedAt} onChange={(e) => set('deletedAt', e.target.value)} />}
        </Field>
      </FieldGroup>

      <FieldGroup title={t.groups.props}>
        <Alert tone="info" className="col-span-2">
          {t.propsNote.before}
          <button type="button" onClick={onGoWorkflow} className="font-semibold underline">
            {t.propsNote.link}
          </button>
          {t.propsNote.after}
        </Alert>
        <Field label={t.fields.kind} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={form.kind} />}
        </Field>
        <Field label={t.fields.sign} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={form.signType} />}
        </Field>
        <Field label={t.fields.grade}>
          {(id) => (
            <Select id={id} value={form.grade} onChange={(e) => set('grade', e.target.value)}>
              {t.gradeOptions.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label={t.fields.autoRenew}>
          {(id) => (
            <Select id={id} value={String(form.autoRenew)} onChange={(e) => set('autoRenew', e.target.value === 'true')}>
              <option value="true">{t.autoRenewOptions.true}</option>
              <option value="false">{t.autoRenewOptions.false}</option>
            </Select>
          )}
        </Field>
      </FieldGroup>
    </EditModal>
  )
}

