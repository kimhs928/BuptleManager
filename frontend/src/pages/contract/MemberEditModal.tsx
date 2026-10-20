import { useState } from 'react'
import { CheckGroup, GroupField, EditModal, Field, FieldGroup, Select, TextInput } from '../../components/ui'
import type { Change } from '../../components/ui'
import { formatDateTime } from '../../lib/date'
import type { ContractMember } from '../../mocks/contract'
import { texts } from '../../texts'
import { makeAudit } from './audit'
import { joinList } from './format'

const t = texts.contract.memberEdit
const opt = texts.contract.memberOptions

type FieldKey = keyof typeof t.fields

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

type Props = {
  member: ContractMember
  onClose: () => void
  onSave: (next: ContractMember, ticket: string) => void
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
    .map((k) => ({ field: t.fields[k], before: show(k, member), after: show(k, form) }))

  const kindLabel = texts.contract.members.kind[member.kind]

  return (
    <EditModal
      title={t.title(member.name)}
      description={t.description(kindLabel)}
      saveLabel="실행"
      changes={changes}
      audit={makeAudit(t.action, openedAt)}
      ticket={ticket}
      onTicketChange={setTicket}
      reason={reason}
      onReasonChange={setReason}
      onClose={onClose}
      onSave={() => onSave(form, ticket.trim())}
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
        <Field label={t.fields.signMethod}>
          {(id) => (
            <Select id={id} value={form.signMethod} onChange={(e) => set('signMethod', e.target.value)}>
              <Options list={opt.signMethods} />
            </Select>
          )}
        </Field>
        <Field label={t.fields.signType}>
          {(id) => (
            <Select id={id} value={form.signType} onChange={(e) => set('signType', e.target.value)}>
              <Options list={opt.signTypes} />
            </Select>
          )}
        </Field>
        <Field label={t.fields.signStatus}>
          {(id) => (
            <Select id={id} value={form.signStatus} onChange={(e) => set('signStatus', e.target.value)}>
              <Options list={opt.signStatuses} />
            </Select>
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
