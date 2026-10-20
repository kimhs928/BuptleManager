import { useState } from 'react'
import { CheckGroup, GroupField, Alert, EditModal, Field, FieldGroup, Select, TextInput } from '../../components/ui'
import type { Change } from '../../components/ui'
import { CheckIcon, CloseIcon } from '../../components/icons'
import { cn } from '../../lib/cn'
import { formatDateTime } from '../../lib/date'
import { MOCK_COMPANY_DETAIL } from '../../mocks/companyDetail'
import { MOCK_DIRECTORY } from '../../mocks/contract'
import type { ContractMember, MemberKind } from '../../mocks/contract'
import { texts } from '../../texts'
import { makeAudit } from './audit'
import { joinList } from './format'

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
  signMethod: '개인 서명',
  signType: 'SMS 인증',
  signStatus: '대기',
}

type Match = 'idle' | 'ok' | 'bad' | 'joined'

function Options({ list }: { list: readonly string[] }) {
  return (
    <>
      {list.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </>
  )
}

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
  const baseFilled = name !== '' && email !== '' && form.signMethod !== '' && form.signType !== ''
  const valid = internal ? match === 'ok' && baseFilled && form.roles.length > 0 && form.perm.length > 0 : baseFilled && !joined

  // 사용자가 직접 입력하거나 기본값에서 바꾼 항목만 보여 준다
  const changes: Change[] = []
  const f = t.fields
  const add = (field: string, value: string, changed: boolean) => changed && value.trim() !== '' && changes.push({ field, after: value })
  add(f.name, name, true)
  add(f.email, email, true)
  if (internal) add(f.userId, userId, true)
  else add(f.company, form.company, true)
  add(f.dept, form.dept, true)
  add(f.phone, form.phone, true)
  add(f.lang, texts.contract.lang[form.lang], form.lang !== emptyForm.lang)
  if (internal) {
    add(f.roles, joinList(form.roles, ''), true)
    add(f.perm, joinList(form.perm, ''), true)
  }
  add(f.signMethod, form.signMethod, form.signMethod !== emptyForm.signMethod)
  add(f.signType, form.signType, form.signType !== emptyForm.signType)
  add(f.signStatus, form.signStatus, form.signStatus !== emptyForm.signStatus)

  const save = () => {
    const now = formatDateTime().replace(' ', 'T')
    const member: ContractMember = {
      id: `m${members.length + 1}`,
      kind,
      roles: internal ? form.roles : [opt.externalRole],
      name,
      email,
      company: internal ? MOCK_COMPANY_DETAIL.name : form.company.trim() || '-',
      dept: form.dept.trim() || '-',
      phone: form.phone.trim() || '-',
      perm: internal ? form.perm : [],
      signMethod: form.signMethod,
      signType: form.signType,
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
            internal ? <TextInput id={id} readOnly value={MOCK_COMPANY_DETAIL.name} /> : <TextInput id={id} value={form.company} onChange={(e) => set('company', e.target.value)} />
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
        <Field label={f.signMethod} required>
          {(id) => (
            <Select id={id} value={form.signMethod} onChange={(e) => set('signMethod', e.target.value)}>
              <Options list={opt.signMethods} />
            </Select>
          )}
        </Field>
        <Field label={f.signType} required>
          {(id) => (
            <Select id={id} value={form.signType} onChange={(e) => set('signType', e.target.value)}>
              <Options list={opt.signTypes} />
            </Select>
          )}
        </Field>
        <Field label={f.signStatus}>
          {(id) => (
            <Select id={id} value={form.signStatus} onChange={(e) => set('signStatus', e.target.value)}>
              <Options list={opt.signStatusesAdd} />
            </Select>
          )}
        </Field>
      </FieldGroup>

      <Alert tone="info">{t.dateNote(openedAt)}</Alert>
    </EditModal>
  )
}
