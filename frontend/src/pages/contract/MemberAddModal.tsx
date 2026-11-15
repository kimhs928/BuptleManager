import { useState } from 'react'
import { useSignTypeOptions } from '../../hooks/useSignTypeOptions'
import { fromSignList, SIGN_NONE, toSignList } from './signOptions'
import { CheckGroup, GroupField, Alert, EditModal, Field, FieldGroup, Select, TextInput } from '../../components/ui'
import type { Change } from '../../components/ui'
import { CheckIcon, CloseIcon } from '../../components/icons'
import { cn } from '../../lib/cn'
import { formatDateTime } from '../../lib/date'
import { currentCompany } from '../../lib/selectedCompany'
import { MOCK_DIRECTORY } from '../../mocks/contract'
import type { ContractMember, MemberKind } from '../../mocks/contract'
import { texts } from '../../texts'
import { makeAudit } from './audit'
import { joinList } from './format'

/** 새 참여자의 서명 상태. 완료는 이 화면에서 만들 수 없다 */
const SIGN_PENDING = '대기'

const t = texts.contract.memberAdd
const opt = texts.contract.memberOptions

type Form = {
  name: string
  email: string
  userId: string
  company: string
  dept: string
  phone: string
  lang: ContractMember['lang']
  roles: string[]
  perm: string[]
  signMethod: string
  signType: string
  signStatus: string
}

const emptyForm: Form = {
  name: '',
  email: '',
  userId: '',
  company: '',
  dept: '',
  phone: '',
  lang: 'ko',
  roles: [],
  perm: [],
  signMethod: SIGN_NONE,
  signType: SIGN_NONE,
  signStatus: SIGN_PENDING,
}

type Match = 'idle' | 'ok' | 'bad' | 'joined'

const matchTone: Record<Match, string> = {
  idle: 'border-line-strong bg-[#f2f2f5] text-ink',
  ok: 'border-success-line bg-success-soft text-success-ink',
  bad: 'border-danger-line bg-danger-soft text-danger-ink',
  joined: 'border-danger-line bg-danger-soft text-danger-ink',
}

type Props = {
  kind: MemberKind
  /** 이미 참여 중인 유저 (삭제된 유저 포함) */
  members: ContractMember[]
  onClose: () => void
  onSave: (member: ContractMember, ticket: string) => void
}

/** 계약 참여 유저 추가 (내부·외부 유저 공용) */
export function MemberAddModal({ kind, members, onClose, onSave }: Props) {
  const [form, setForm] = useState<Form>(emptyForm)
  const [ticket, setTicket] = useState('')
  const [reason, setReason] = useState('')
  const [openedAt] = useState(() => formatDateTime())

  const internal = kind === 'internal'
  const kindLabel = texts.contract.members.kind[kind]
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }))

  const name = form.name.trim()
  const email = form.email.trim()
  const userId = form.userId.trim()
  const joined = email !== '' && members.some((m) => m.email.toLowerCase() === email.toLowerCase())
  const inDirectory = MOCK_DIRECTORY.some((d) => d.name === name && d.email.toLowerCase() === email.toLowerCase() && d.userId === userId)

  // 내부 유저는 사내 유저(이름·이메일·user_id)와 모두 일치해야 하고, 이미 참여 중이면 안 된다
  const match: Match = joined ? 'joined' : inDirectory ? 'ok' : name && email && userId ? 'bad' : 'idle'
  const signTypeOptions = useSignTypeOptions()
  // 내부 유저는 권한에 '서명'이 체크되어 있을 때만 서명 방식·종류를 고른다 (아니면 '-')
  const signLocked = internal && !form.perm.includes('서명')
  // 서명 방식·종류는 서명 권한이 있는 내부 유저만 필수다. 외부 유저는 비워도 된다
  const signRequired = internal && !signLocked
  const baseFilled = name !== '' && email !== '' && (!signRequired || (form.signMethod !== SIGN_NONE && form.signType !== SIGN_NONE))
  const valid = internal ? match === 'ok' && baseFilled && form.roles.length > 0 && form.perm.length > 0 : baseFilled && !joined

  // 사용자가 직접 입력하거나 기본값에서 바꾼 항목만 보여 준다
  const changes: Change[] = []
  const f = t.fields
  // 각 항목은 그 입력만 처음 값(비움 또는 기본값)으로 되돌린다
  const reset = (key: keyof Form) => () => set(key, emptyForm[key])
  const add = (field: string, value: string, changed: boolean, key: keyof Form) => changed && value.trim() !== '' && changes.push({ field, after: value, reset: reset(key) })
  add(f.name, name, true, 'name')
  add(f.email, email, true, 'email')
  if (internal) add(f.userId, userId, true, 'userId')
  else add(f.company, form.company, true, 'company')
  add(f.dept, form.dept, true, 'dept')
  add(f.phone, form.phone, true, 'phone')
  add(f.lang, texts.contract.lang[form.lang], form.lang !== emptyForm.lang, 'lang')
  if (internal) {
    add(f.roles, joinList(form.roles, ''), true, 'roles')
    add(f.perm, joinList(form.perm, ''), true, 'perm')
  }
  if (!signLocked) {
    add(f.signMethod, form.signMethod, form.signMethod !== emptyForm.signMethod, 'signMethod')
    add(f.signType, form.signType, form.signType !== emptyForm.signType, 'signType')
  }

  const save = () => {
    const now = formatDateTime().replace(' ', 'T')
    const member: ContractMember = {
      id: `m${members.length + 1}`,
      kind,
      roles: internal ? form.roles : [opt.externalRole],
      name,
      email,
      company: internal ? currentCompany().name : form.company.trim() || '-',
      dept: form.dept.trim() || '-',
      phone: form.phone.trim() || '-',
      perm: internal ? form.perm : [],
      signMethod: signLocked ? SIGN_NONE : form.signMethod,
      signType: signLocked ? SIGN_NONE : form.signType,
      signStatus: form.signStatus,
      lang: form.lang,
      sysRoles: internal ? ['일반유저'] : [],
      deleted: false,
      joinedAt: now,
      updatedAt: now,
      deletedAt: '',
    }
    onSave(member, ticket.trim())
  }

  return (
    <EditModal
      title={t.title}
      description={t.description(kindLabel)}
      saveLabel={t.save}
      changes={changes}
      onResetAll={() => setForm(emptyForm)}
      canSubmit={valid}
      changesTitle={t.changesTitle}
      changesEmpty={t.changesEmpty}
      audit={makeAudit(t.action, openedAt)}
      ticket={ticket}
      onTicketChange={setTicket}
      reason={reason}
      onReasonChange={setReason}
      onClose={onClose}
      onSave={save}
    >
      <FieldGroup title={t.groups.info}>
        {internal && (
          <div role="status" className={cn('col-span-2 flex items-start gap-2.5 rounded-[10px] border px-3.5 py-3 text-[13px] leading-normal', matchTone[match])}>
            {match !== 'idle' && (
              <span aria-hidden="true" className="mt-px inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-current">
                {match === 'ok' ? <CheckIcon size={11} strokeWidth={3} className="text-white" /> : <CloseIcon size={11} strokeWidth={3} className="text-white" />}
              </span>
            )}
            <span>{t.match[match]}</span>
          </div>
        )}
        <Field label={f.name} required>
          {(id) => <TextInput id={id} value={form.name} onChange={(e) => set('name', e.target.value)} />}
        </Field>
        <Field label={f.email} required hint={!internal && joined ? t.duplicateEmail : undefined}>
          {(id) => <TextInput id={id} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} aria-invalid={joined || undefined} />}
        </Field>
        {internal && (
          <Field label={f.userId} required>
            {(id) => <TextInput id={id} placeholder={t.userIdPlaceholder} value={form.userId} onChange={(e) => set('userId', e.target.value)} />}
          </Field>
        )}
        <Field label={f.kind} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={kindLabel} />}
        </Field>
        <Field label={f.company} readOnlyHint={internal}>
          {(id) =>
            internal ? <TextInput id={id} readOnly value={currentCompany().name} /> : <TextInput id={id} value={form.company} onChange={(e) => set('company', e.target.value)} />
          }
        </Field>
        <Field label={f.dept}>{(id) => <TextInput id={id} value={form.dept} onChange={(e) => set('dept', e.target.value)} />}</Field>
        <Field label={f.phone}>{(id) => <TextInput id={id} type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} />}</Field>
        <Field label={f.lang}>
          {(id) => (
            <Select id={id} value={form.lang} onChange={(e) => set('lang', e.target.value as Form['lang'])}>
              {(Object.keys(texts.contract.lang) as Form['lang'][]).map((k) => (
                <option key={k} value={k}>
                  {texts.contract.lang[k]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label={f.sysRoles} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={internal ? t.sysRolesInternal : '-'} />}
        </Field>
        {!internal && (
          <Alert tone="info" className="col-span-2">
            {t.externalEmailNote}
          </Alert>
        )}
      </FieldGroup>

      <FieldGroup title={t.groups.roles}>
        {internal ? (
          <>
            <GroupField label={f.roles} hint={t.multi} required>
              <CheckGroup label={f.roles} options={opt.roles} value={form.roles} onChange={(v) => set('roles', v)} />
            </GroupField>
            <GroupField label={f.perm} hint={t.multi} required>
              <CheckGroup label={f.perm} options={opt.permsAdd} value={form.perm} onChange={(v) => set('perm', v)} />
            </GroupField>
          </>
        ) : (
          <>
            <Field label={f.roles} readOnlyHint>
              {(id) => <TextInput id={id} readOnly value={opt.externalRole} />}
            </Field>
            <Field label={f.perm} readOnlyHint>
              {(id) => <TextInput id={id} readOnly value="-" />}
            </Field>
            <Alert tone="info" className="col-span-2">
              {t.externalRoleNote}
            </Alert>
          </>
        )}
      </FieldGroup>

      <FieldGroup title={t.groups.sign}>
        {signLocked && (
          <Alert tone="warn" className="col-span-2">
            {texts.contract.memberEdit.signLockedNote}
          </Alert>
        )}
        <GroupField label={f.signMethod} hint={t.multi} required={signRequired}>
          <CheckGroup label={f.signMethod} disabled={signLocked} options={opt.signMethods.filter((o) => o !== SIGN_NONE)} value={toSignList(form.signMethod)} onChange={(v) => set('signMethod', fromSignList(v))} />
        </GroupField>
        <GroupField label={f.signType} hint={t.multi} required={signRequired}>
          <CheckGroup label={f.signType} disabled={signLocked} options={signTypeOptions} value={toSignList(form.signType)} onChange={(v) => set('signType', fromSignList(v))} />
        </GroupField>
        {/* 새로 추가하는 참여자의 서명 상태는 항상 대기. 완료는 유저가 직접 서명해야 된다 */}
        <Field label={f.signStatus} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={SIGN_PENDING} />}
        </Field>
      </FieldGroup>

      <Alert tone="info">{t.dateNote()}</Alert>
    </EditModal>
  )
}
