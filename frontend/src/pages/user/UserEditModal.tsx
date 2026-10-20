import { useState } from 'react'
import { CheckGroup, EditModal, Field, FieldGroup, Select, Textarea, TextInput } from '../../components/ui'
import type { Change } from '../../components/ui'
import { formatDateTime } from '../../lib/date'
import { SYSTEM_ROLES } from '../../mocks/user'
import type { CompanyUser } from '../../mocks/user'
import { texts } from '../../texts'
import { makeAudit } from '../contract/audit'

const t = texts.user.edit

type Key = keyof typeof t.labels
const keys = Object.keys(t.labels) as Key[]

function show(key: Key, u: CompanyUser): string {
  switch (key) {
    case 'active':
      return u.active ? t.activeOptions.true : t.activeOptions.false
    case 'roles':
      return u.roles.join(', ') || t.none
    default:
      return String(u[key]) === '' ? t.none : String(u[key])
  }
}

/** datetime-local 입력용 값 */
const toInput = (v: string) => v.replace(' ', 'T')
const fromInput = (v: string) => v.replace('T', ' ')

type Props = {
  user: CompanyUser
  onClose: () => void
  onSave: (next: CompanyUser, ticket: string) => void
}

/** 유저 정보 수정 */
export function UserEditModal({ user, onClose, onSave }: Props) {
  const [form, setForm] = useState<CompanyUser>(user)
  const [ticket, setTicket] = useState('')
  const [reason, setReason] = useState('')
  const [openedAt] = useState(() => formatDateTime())

  const set = <K extends keyof CompanyUser>(key: K, value: CompanyUser[K]) => setForm((f) => ({ ...f, [key]: value }))
  const changes: Change[] = keys.filter((k) => show(k, form) !== show(k, user)).map((k) => ({ field: t.labels[k], before: show(k, user), after: show(k, form) }))

  return (
    <EditModal
      title={t.title(user.name)}
      description={t.description(user.email)}
      saveLabel="실행"
      changes={changes}
      canSubmit={form.name.trim() !== '' && form.email.trim() !== ''}
      audit={makeAudit(t.action, openedAt)}
      ticket={ticket}
      onTicketChange={setTicket}
      reason={reason}
      onReasonChange={setReason}
      onClose={onClose}
      onSave={() => onSave(form, ticket.trim())}
    >
      <div className="grid grid-cols-2 items-stretch gap-3.5">
        <FieldGroup title={`${t.groups.id} · ${t.idNote}`} className="col-span-2">
          <Field label="PK" readOnlyHint>
            {(id) => <TextInput id={id} readOnly value={user.pk} className="font-mono" />}
          </Field>
          <Field label={texts.user.list.fields.migrated} readOnlyHint>
            {(id) => <TextInput id={id} readOnly value={user.migrated ? 'Y' : 'N'} />}
          </Field>
        </FieldGroup>

        <FieldGroup title={t.groups.info} columns={1}>
          <Field label={t.labels.name} required>
            {(id) => <TextInput id={id} value={form.name} onChange={(e) => set('name', e.target.value)} />}
          </Field>
          <Field label={t.labels.email} required>
            {(id) => <TextInput id={id} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />}
          </Field>
          <Field label={t.labels.phone}>{(id) => <TextInput id={id} type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} />}</Field>
        </FieldGroup>

        <FieldGroup title={t.groups.org} columns={1}>
          <Field label={t.labels.empNo}>{(id) => <TextInput id={id} value={form.empNo} onChange={(e) => set('empNo', e.target.value)} />}</Field>
          <Field label={t.labels.dept}>{(id) => <TextInput id={id} value={form.dept} onChange={(e) => set('dept', e.target.value)} />}</Field>
          <Field label={t.labels.title}>{(id) => <TextInput id={id} value={form.title} onChange={(e) => set('title', e.target.value)} />}</Field>
        </FieldGroup>

        <FieldGroup title={`${t.groups.roles} · ${t.rolesNote}`} columns={1}>
          <CheckGroup label={t.groups.roles} options={SYSTEM_ROLES} value={form.roles} onChange={(next) => set('roles', next as CompanyUser['roles'])} />
        </FieldGroup>

        <FieldGroup title={t.groups.status} columns={1}>
          <Field label={t.labels.active}>
            {(id) => (
              <Select id={id} value={String(form.active)} onChange={(e) => set('active', e.target.value === 'true')}>
                <option value="true">{t.activeOptions.true}</option>
                <option value="false">{t.activeOptions.false}</option>
              </Select>
            )}
          </Field>
        </FieldGroup>

        <FieldGroup title={`${t.groups.dates} · ${t.datesNote}`} className="col-span-2">
          {(['lastLogin', 'createdAt', 'joinedAt', 'updatedAt'] as const).map((k) => (
            <Field key={k} label={t.labels[k]}>
              {(id) => <TextInput id={id} type="datetime-local" step={1} value={toInput(form[k])} onChange={(e) => set(k, fromInput(e.target.value))} className="tabular-nums" />}
            </Field>
          ))}
        </FieldGroup>

        <FieldGroup title={t.groups.desc} columns={1} className="col-span-2">
          <Textarea aria-label={t.groups.desc} rows={2} value={form.desc} onChange={(e) => set('desc', e.target.value)} />
        </FieldGroup>
      </div>
    </EditModal>
  )
}
