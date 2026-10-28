import { useState } from 'react'
import { CloseIcon, PlusIcon } from '../../components/icons'
import { Button, EditModal, Field, FieldGroup, Select, TextInput } from '../../components/ui'
import type { Change } from '../../components/ui'
import { formatDateTime } from '../../lib/date'
import { COUNSEL_STATUS_INFO, COUNSEL_STATUSES } from '../../mocks/counsel'
import type { CounselDetail, CounselStatus, CounselType, ShowRangeType } from '../../mocks/counsel'
import { texts } from '../../texts'
import { makeAudit } from '../contract/audit'

const t = texts.counsel.basicEdit
const tb = texts.counsel.basic

const COUNSEL_TYPES: CounselType[] = ['PUBLIC', 'PRIVATE']
const SHOW_RANGES: ShowRangeType[] = ['PRIVATE', 'INNER', 'OUTER', 'DEPARTMENT']

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
  const [projectInput, setProjectInput] = useState('')
  const [openedAt] = useState(() => formatDateTime())

  const set = <K extends keyof CounselDetail>(key: K, value: CounselDetail[K]) => setForm((f) => ({ ...f, [key]: value }))
  const deletedText = (v: boolean) => t.deletedOptions[String(v) as 'true' | 'false']

  const addProject = () => {
    const name = projectInput.trim()
    if (name && !form.projects.includes(name)) set('projects', [...form.projects, name])
    setProjectInput('')
  }
  const projectsText = (list: string[]) => (list.length > 0 ? list.join(', ') : t.projectsNone)

  const changes: Change[] = []
  if (form.status !== counsel.status) changes.push({ field: t.fields.status, before: COUNSEL_STATUS_INFO[counsel.status].label, after: COUNSEL_STATUS_INFO[form.status].label })
  if (form.name !== counsel.name) changes.push({ field: t.fields.name, before: counsel.name, after: form.name })
  if (form.counselType !== counsel.counselType) changes.push({ field: t.fields.counselType, before: tb.counselTypes[counsel.counselType], after: tb.counselTypes[form.counselType] })
  if (form.showRangeType !== counsel.showRangeType) changes.push({ field: t.fields.showRange, before: tb.showRanges[counsel.showRangeType], after: tb.showRanges[form.showRangeType] })
  if (form.projects.join('|') !== counsel.projects.join('|')) changes.push({ field: t.fields.projects, before: projectsText(counsel.projects), after: projectsText(form.projects) })
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
                  {COUNSEL_STATUS_INFO[s].label}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label={t.fields.name} required className="col-span-2">
          {(id) => <TextInput id={id} value={form.name} onChange={(e) => set('name', e.target.value)} />}
        </Field>
        <Field label={t.fields.counselType} required>
          {(id) => (
            <Select id={id} value={form.counselType} onChange={(e) => set('counselType', e.target.value as CounselType)}>
              {COUNSEL_TYPES.map((v) => (
                <option key={v} value={v}>
                  {tb.counselTypes[v]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label={t.fields.showRange} required>
          {(id) => (
            <Select id={id} value={form.showRangeType} onChange={(e) => set('showRangeType', e.target.value as ShowRangeType)}>
              {SHOW_RANGES.map((v) => (
                <option key={v} value={v}>
                  {tb.showRanges[v]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label={t.fields.migrated} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={counsel.migrated ? tb.migratedYes : tb.migratedNo} />}
        </Field>
      </FieldGroup>

      <FieldGroup title={t.groups.category}>
        <Field label={t.fields.categoryParent} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={counsel.categoryParent || '-'} />}
        </Field>
        <Field label={t.fields.category} readOnlyHint>
          {(id) => <TextInput id={id} readOnly value={counsel.category || '-'} />}
        </Field>
      </FieldGroup>

      <FieldGroup title={t.groups.projects} columns={1}>
        <Field label={t.fields.projects} hint={t.projectHint}>
          {(id) => (
            <div className="flex flex-col gap-2">
              {form.projects.length > 0 && (
                <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                  {form.projects.map((p) => (
                    <li key={p} className="inline-flex h-7 items-center gap-1 rounded-md bg-[#f2f2f5] pl-2.5 pr-1 text-[13px] text-ink-2">
                      {p}
                      <button
                        type="button"
                        aria-label={t.projectRemove(p)}
                        onClick={() => set('projects', form.projects.filter((x) => x !== p))}
                        className="grid size-5 place-items-center rounded text-ink-4 hover:bg-fill hover:text-ink"
                      >
                        <CloseIcon size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex gap-2">
                <TextInput
                  id={id}
                  value={projectInput}
                  placeholder={t.projectPlaceholder}
                  onChange={(e) => setProjectInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addProject()
                    }
                  }}
                />
                <Button variant="secondary" size="md" icon={<PlusIcon size={13} />} onClick={addProject} disabled={projectInput.trim() === ''} className="shrink-0">
                  {t.projectAdd}
                </Button>
              </div>
            </div>
          )}
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
