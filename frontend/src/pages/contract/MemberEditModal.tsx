import { useState } from 'react'
import { fromSignList, SIGN_NONE, toSignList, withCurrent } from './signOptions'
import { useSignTypeOptions } from '../../hooks/useSignTypeOptions'
import { Alert, Button, CheckGroup, GroupField, EditModal, Field, FieldGroup, Select, TextInput } from '../../components/ui'
import type { Change } from '../../components/ui'
import { formatDateTime } from '../../lib/date'
import type { ContractMember } from '../../mocks/contract'
import { texts } from '../../texts'
import { makeAudit } from './audit'
import { joinList } from './format'
import type { Audit } from '../../lib/apiWrite'

const t = texts.contract.memberEdit
const opt = texts.contract.memberOptions

type FieldKey = keyof typeof t.fields

/** 서명 정보를 고치려면 권한에 있어야 하는 값 */
const SIGN_PERM = '서명'
/** 서명 상태 값. 완료는 유저가 직접 서명해야만 되고, 취소하면 대기로 돌아간다 */
const SIGN_DONE = '완료'
const SIGN_PENDING = '대기'

const internalKeys: FieldKey[] = ['roles', 'perm', 'dept', 'phone', 'lang', 'signMethod', 'signType', 'signStatus', 'joinedAt', 'updatedAt', 'deleted', 'deletedAt']
const externalKeys: FieldKey[] = ['name', 'email', 'company', 'dept', 'phone', 'lang', 'signMethod', 'signType', 'signStatus', 'joinedAt', 'updatedAt', 'deleted', 'deletedAt']

function show(key: FieldKey, m: ContractMember): string {
  switch (key) {
    case 'roles':
    case 'perm':
      return joinList(m[key], texts.contract.none)
    case 'lang':
      return texts.contract.lang[m.lang]
    case 'deleted':
      return t.deletedOptions[String(m.deleted) as 'true' | 'false']
    case 'joinedAt':
    case 'updatedAt':
    case 'deletedAt':
      return m[key] ? m[key].replace('T', ' ') : texts.contract.none
    default:
      return String(m[key as keyof ContractMember] ?? '') || texts.contract.none
  }
}

type Props = {
  member: ContractMember
  onClose: () => void
  onSave: (next: ContractMember, audit: Audit) => void | Promise<void>
}

/** 계약 참여 유저 수정 (내부·외부 유저 공용) */
export function MemberEditModal({ member, onClose, onSave }: Props) {
  const [form, setForm] = useState<ContractMember>(member)
  const [ticket, setTicket] = useState('')
  const [reason, setReason] = useState('')
  const [openedAt] = useState(() => formatDateTime())

  const internal = member.kind === 'internal'
  const set = <K extends keyof ContractMember>(key: K, value: ContractMember[K]) => setForm((f) => ({ ...f, [key]: value }))

  const changes: Change[] = (internal ? internalKeys : externalKeys)
    .filter((k) => show(k, form) !== show(k, member))
    .map((k) => ({ field: t.fields[k], before: show(k, member), after: show(k, form), reset: () => setForm((f) => ({ ...f, [k]: member[k as keyof ContractMember] })) }))

  const kindLabel = texts.contract.members.kind[member.kind]
  // 내부 유저는 권한에 '서명'이 체크되어 있을 때만 서명 정보를 고칠 수 있다
  // 서명 방식·종류는 여러 개를 고를 수 있다. 값은 ', ' 로 이어 붙인 글자(없으면 '-')로 들고 있다
  const signTypeEnum = useSignTypeOptions()
  const methodOptions = withCurrent(opt.signMethods.filter((o) => o !== SIGN_NONE), toSignList(form.signMethod))
  const typeOptions = withCurrent(signTypeEnum, toSignList(form.signType))
  const signLocked = internal && !form.perm.includes(SIGN_PERM)

  return (
    <EditModal
      title={t.title(member.name)}
      description={t.description(kindLabel)}
      saveLabel="실행"
      changes={changes}
      onResetAll={() => setForm(member)}
      audit={makeAudit(t.action, openedAt)}
      ticket={ticket}
      onTicketChange={setTicket}
      reason={reason}
      onReasonChange={setReason}
      onClose={onClose}
      onSave={(_at, requester) => onSave(form, { ticket: ticket.trim(), requester, reason: reason.trim() })}
    >
      <FieldGroup title={t.groups.info}>
        <Field label={t.fields.name} readOnlyHint={internal}>
          {(id) => <TextInput id={id} readOnly={internal} value={form.name} onChange={(e) => set('name', e.target.value)} />}
        </Field>
        <Field label={t.fields.kind} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={kindLabel} />}
        </Field>
        <Field label={t.fields.email} readOnlyHint={internal}>
          {(id) => <TextInput id={id} type={internal ? 'text' : 'email'} readOnly={internal} value={form.email} onChange={(e) => set('email', e.target.value)} />}
        </Field>
        <Field label={t.fields.company} readOnlyHint={internal}>
          {(id) => <TextInput id={id} readOnly={internal} value={form.company} onChange={(e) => set('company', e.target.value)} />}
        </Field>
        <Field label={t.fields.dept}>{(id) => <TextInput id={id} value={form.dept} onChange={(e) => set('dept', e.target.value)} />}</Field>
        <Field label={t.fields.phone}>{(id) => <TextInput id={id} type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} />}</Field>
        <Field label={t.fields.lang}>
          {(id) => (
            <Select id={id} value={form.lang} onChange={(e) => set('lang', e.target.value as ContractMember['lang'])}>
              {(Object.keys(texts.contract.lang) as ContractMember['lang'][]).map((k) => (
                <option key={k} value={k}>
                  {texts.contract.lang[k]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label={t.fields.sysRoles} readOnlyHint hint={internal ? t.sysRolesNote : t.externalSysNote}>
          {(id) => <TextInput id={id} readOnly value={internal && member.sysRoles.length > 0 ? member.sysRoles.join(', ') : '-'} />}
        </Field>
      </FieldGroup>

      <FieldGroup title={t.groups.roles}>
        {internal ? (
          <>
            <GroupField label={t.fields.roles}>
              <CheckGroup label={t.fields.roles} options={opt.roles} value={form.roles} onChange={(v) => set('roles', v)} />
            </GroupField>
            <GroupField label={t.fields.perm}>
              <CheckGroup label={t.fields.perm} options={opt.permsEdit} value={form.perm} onChange={(v) => set('perm', v)} />
            </GroupField>
          </>
        ) : (
          <>
            <Field label={t.fields.roles} readOnlyHint>
              {(id) => <TextInput id={id} readOnly value={member.roles.join(', ')} />}
            </Field>
            <Field label={t.fields.perm} readOnlyHint>
              {(id) => <TextInput id={id} readOnly value="-" />}
            </Field>
          </>
        )}
      </FieldGroup>

      <FieldGroup title={t.groups.sign}>
        {signLocked && (
          <Alert tone="warn" className="col-span-2">
            {t.signLockedNote}
          </Alert>
        )}
        <GroupField label={t.fields.signMethod} hint={t.multi}>
          <CheckGroup label={t.fields.signMethod} disabled={signLocked} options={methodOptions} value={toSignList(form.signMethod)} onChange={(v) => set('signMethod', fromSignList(v))} />
        </GroupField>
        <GroupField label={t.fields.signType} hint={t.multi}>
          <CheckGroup label={t.fields.signType} disabled={signLocked} options={typeOptions} value={toSignList(form.signType)} onChange={(v) => set('signType', fromSignList(v))} />
        </GroupField>
        {/* 서명 상태는 이 화면에서 완료로 바꿀 수 없다(유저가 직접 서명해야 완료). 완료된 서명은 취소만 가능하다 */}
        <Field label={t.fields.signStatus} readOnlyHint>
          {(id) => (
            <div className="flex items-center gap-2">
              <TextInput id={id} readOnly value={form.signStatus} />
              {form.signStatus === SIGN_DONE && (
                <Button type="button" variant="secondary" disabled={signLocked} onClick={() => set('signStatus', SIGN_PENDING)} className="h-[38px] shrink-0 whitespace-nowrap text-danger-ink">
                  {t.signCancel}
                </Button>
              )}
            </div>
          )}
        </Field>
      </FieldGroup>

      <FieldGroup title={t.groups.dates}>
        <Field label={t.fields.joinedAt}>
          {(id) => <TextInput id={id} type="datetime-local" value={form.joinedAt} onChange={(e) => set('joinedAt', e.target.value)} />}
        </Field>
        <Field label={t.fields.updatedAt}>
          {(id) => <TextInput id={id} type="datetime-local" value={form.updatedAt} onChange={(e) => set('updatedAt', e.target.value)} />}
        </Field>
        <Field label={t.fields.deleted}>
          {(id) => (
            <Select id={id} value={String(form.deleted)} onChange={(e) => set('deleted', e.target.value === 'true')}>
              <option value="false">{t.deletedOptions.false}</option>
              <option value="true">{t.deletedOptions.true}</option>
            </Select>
          )}
        </Field>
        <Field label={t.fields.deletedAt}>
          {(id) => <TextInput id={id} type="datetime-local" value={form.deletedAt} onChange={(e) => set('deletedAt', e.target.value)} />}
        </Field>
      </FieldGroup>
    </EditModal>
  )
}
