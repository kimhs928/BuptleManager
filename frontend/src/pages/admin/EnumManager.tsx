import { useEffect, useState } from 'react'
import { Alert, Button, Card, Select, TextInput } from '../../components/ui'
import { cn } from '../../lib/cn'
import { enumApi } from '../../lib/enums'
import type { EnumGroup, EnumSetSummary, EnumValue } from '../../lib/enums'
import { useEnumSet } from '../../hooks/useEnumSet'
import { texts } from '../../texts'

const t = texts.admin.enums

const thClass = 'whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-ink-3'
const tdClass = 'px-3 py-2 align-middle'

function messageOf(e: unknown) {
  return e instanceof Error && e.message ? e.message : t.saveFailed
}

/** 값 한 줄. 수정한 내용은 저장 버튼을 눌러야 반영된다 */
function ValueRow({ set, value, groups, onSaved }: { set: string; value: EnumValue; groups: EnumGroup[]; onSaved: () => void }) {
  const [draft, setDraft] = useState(value)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const dirty =
    draft.label !== value.label ||
    (draft.remark ?? '') !== (value.remark ?? '') ||
    draft.groupCode !== value.groupCode ||
    draft.sortOrder !== value.sortOrder ||
    draft.active !== value.active
  const canSave = dirty && draft.label.trim() !== '' && !saving

  const save = () => {
    setSaving(true)
    setError('')
    enumApi
      .updateValue(set, value.id, { label: draft.label, remark: draft.remark, groupCode: draft.groupCode, sortOrder: draft.sortOrder, active: draft.active })
      .then(onSaved)
      .catch((e: unknown) => setError(messageOf(e)))
      .finally(() => setSaving(false))
  }

  return (
    <tr className={cn('border-t border-line-soft', !draft.active && 'bg-[#fafafb]')}>
      <td className={cn(tdClass, 'whitespace-nowrap pl-5 tabular-nums font-semibold')}>{value.code}</td>
      <td className={cn(tdClass, 'max-w-[220px] truncate text-xs text-ink-4')} title={value.constName ?? ''}>
        {value.constName ?? '-'}
      </td>
      <td className={tdClass}>
        <TextInput aria-label={`${value.code} ${t.columns.label}`} value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
      </td>
      {groups.length > 0 && (
        <td className={tdClass}>
          <Select aria-label={`${value.code} ${t.columns.group}`} value={draft.groupCode ?? ''} onChange={(e) => setDraft({ ...draft, groupCode: e.target.value || null })}>
            <option value="">{t.noGroup}</option>
            {groups.map((g) => (
              <option key={g.code} value={g.code}>
                {g.name}
              </option>
            ))}
          </Select>
        </td>
      )}
      <td className={tdClass}>
        <TextInput
          aria-label={`${value.code} ${t.columns.order}`}
          type="number"
          className="w-[84px]"
          value={draft.sortOrder}
          onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) || 0 })}
        />
      </td>
      <td className={cn(tdClass, 'text-center')}>
        <input type="checkbox" aria-label={`${value.code} ${t.columns.active}`} checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} className="size-4 accent-primary" />
      </td>
      <td className={cn(tdClass, 'pr-5')}>
        <div className="flex flex-col items-end gap-1">
          <Button size="sm" variant={canSave ? 'primary' : 'secondary'} disabled={!canSave} loading={saving} onClick={save}>
            {t.save}
          </Button>
          {error && <span role="alert" className="text-[11.5px] text-danger-ink">{error}</span>}
        </div>
      </td>
    </tr>
  )
}

/** 분류 이름 한 칸 */
function GroupName({ set, group, onSaved }: { set: string; group: EnumGroup; onSaved: () => void }) {
  const [name, setName] = useState(group.name)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const dirty = name.trim() !== '' && name !== group.name

  const save = () => {
    setSaving(true)
    setError('')
    enumApi
      .renameGroup(set, group.code, name)
      .then(onSaved)
      .catch((e: unknown) => setError(messageOf(e)))
      .finally(() => setSaving(false))
  }

  return (
    <li className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <TextInput aria-label={`${group.code} ${t.groupName}`} value={name} onChange={(e) => setName(e.target.value)} className="min-w-0 flex-1" />
        <Button size="sm" variant="secondary" disabled={!dirty || saving} loading={saving} onClick={save}>
          {t.save}
        </Button>
      </div>
      <span className="px-1 text-[11px] text-ink-4">{group.code}</span>
      {error && <span role="alert" className="px-1 text-[11.5px] text-danger-ink">{error}</span>}
    </li>
  )
}

function AddValue({ set, groups, onAdded }: { set: string; groups: EnumGroup[]; onAdded: () => void }) {
  const [form, setForm] = useState({ code: '', constName: '', label: '', groupCode: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const canSubmit = form.code.trim() !== '' && form.label.trim() !== '' && !saving

  const submit = () => {
    setSaving(true)
    setError('')
    enumApi
      .createValue(set, { code: form.code, constName: form.constName || undefined, label: form.label, groupCode: form.groupCode || null })
      .then(() => {
        setForm({ code: '', constName: '', label: '', groupCode: '' })
        onAdded()
      })
      .catch((e: unknown) => setError(messageOf(e)))
      .finally(() => setSaving(false))
  }

  return (
    <div className="flex flex-col gap-2 border-t border-line-soft px-5 py-4">
      <h3 className="m-0 text-[13px] font-semibold">{t.add.title}</h3>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs text-ink-3">
          {t.add.code}
          <TextInput value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-[110px]" autoComplete="off" />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-3">
          {t.add.constName}
          <TextInput value={form.constName} onChange={(e) => setForm({ ...form, constName: e.target.value })} className="w-[220px]" autoComplete="off" />
        </label>
        <label className="flex min-w-[200px] flex-1 flex-col gap-1 text-xs text-ink-3">
          {t.add.label}
          <TextInput value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} autoComplete="off" />
        </label>
        {groups.length > 0 && (
          <label className="flex flex-col gap-1 text-xs text-ink-3">
            {t.columns.group}
            <Select value={form.groupCode} onChange={(e) => setForm({ ...form, groupCode: e.target.value })}>
              <option value="">{t.noGroup}</option>
              {groups.map((g) => (
                <option key={g.code} value={g.code}>
                  {g.name}
                </option>
              ))}
            </Select>
          </label>
        )}
        <Button disabled={!canSubmit} loading={saving} onClick={submit}>
          {t.add.button}
        </Button>
      </div>
      <span className="text-[11.5px] text-ink-4">{t.add.note}</span>
      {error && <span role="alert" className="text-[12px] text-danger-ink">{error}</span>}
    </div>
  )
}

/** 관리자 페이지: 드롭다운 선택지(enum)를 DB 에서 관리한다 */
export function EnumManager() {
  const [sets, setSets] = useState<EnumSetSummary[] | null>(null)
  const [setsError, setSetsError] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const { data, loading, error, reload } = useEnumSet(selected)

  useEffect(() => {
    const controller = new AbortController()
    enumApi
      .sets(controller.signal)
      .then((list) => {
        setSets(list)
        setSelected((cur) => cur ?? list[0]?.code ?? null)
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setSetsError(true)
      })
    return () => controller.abort()
  }, [])

  const groups = data?.groups ?? []
  const values = (data?.values ?? []).filter((v) => filter === '' || v.groupCode === (filter === '__none__' ? null : filter))

  return (
    <section aria-labelledby="admin-enum-title" className="flex flex-col gap-2">
      <h2 id="admin-enum-title" className="m-0 px-3 text-[13px] font-semibold">
        {t.title}
      </h2>
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 px-6 py-5">
          <p className="m-0 text-[13px] leading-normal text-ink-3">{t.description}</p>
          {setsError && <Alert tone="danger">{t.loadFailed}</Alert>}
          {sets && (
            <div role="tablist" aria-label={t.setTabs} className="flex flex-wrap gap-1.5">
              {sets.map((s) => {
                const on = s.code === selected
                return (
                  <button
                    key={s.code}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => {
                      setSelected(s.code)
                      setFilter('')
                    }}
                    className={cn(
                      'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium',
                      on ? 'border-ink bg-ink text-white' : 'border-line-strong bg-surface text-ink-2 hover:bg-hover',
                    )}
                  >
                    {s.name}
                    <span className={cn('text-[11.5px] tabular-nums', on ? 'text-white/70' : 'text-ink-4')}>{s.valueCount}</span>
                  </button>
                )
              })}
            </div>
          )}
          {data?.set.description && <span className="text-xs text-ink-4">{data.set.description}</span>}
        </div>

        {loading && <div className="border-t border-line-soft px-6 py-8 text-center text-[13px] text-ink-4">{t.loading}</div>}
        {error && <div className="border-t border-line-soft px-6 py-8 text-center text-[13px] text-danger-ink">{t.loadFailed}</div>}

        {data && (
          <>
            {groups.length > 0 && (
              <details className="border-t border-line-soft px-6 py-3">
                <summary className="cursor-pointer text-[13px] font-semibold">{t.groupsTitle(groups.length)}</summary>
                <ul className="m-0 mt-3 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2">
                  {groups.map((g) => (
                    <GroupName key={`${g.code}:${g.name}`} set={data.set.code} group={g} onSaved={reload} />
                  ))}
                </ul>
              </details>
            )}

            {groups.length > 0 && (
              <div className="flex items-center gap-2 border-t border-line-soft px-6 py-3">
                <label htmlFor="enum-group-filter" className="text-xs text-ink-3">
                  {t.filter}
                </label>
                <Select id="enum-group-filter" value={filter} onChange={(e) => setFilter(e.target.value)} className="w-[240px]">
                  <option value="">{t.filterAll}</option>
                  {groups.map((g) => (
                    <option key={g.code} value={g.code}>
                      {g.name}
                    </option>
                  ))}
                  <option value="__none__">{t.noGroup}</option>
                </Select>
                <span className="text-xs tabular-nums text-ink-4">{t.count(values.length)}</span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-[13.5px]">
                <thead>
                  <tr>
                    <th scope="col" className={cn(thClass, 'pl-5')}>{t.columns.code}</th>
                    <th scope="col" className={thClass}>{t.columns.constName}</th>
                    <th scope="col" className={thClass}>{t.columns.label}</th>
                    {groups.length > 0 && <th scope="col" className={thClass}>{t.columns.group}</th>}
                    <th scope="col" className={thClass}>{t.columns.order}</th>
                    <th scope="col" className={cn(thClass, 'text-center')}>{t.columns.active}</th>
                    <th scope="col" className={cn(thClass, 'pr-5')}><span className="sr-only">{t.save}</span></th>
                  </tr>
                </thead>
                <tbody>
                  {values.map((v) => (
                    <ValueRow key={`${v.id}:${v.label}:${v.remark}:${v.groupCode}:${v.sortOrder}:${v.active}`} set={data.set.code} value={v} groups={groups} onSaved={reload} />
                  ))}
                  {values.length === 0 && (
                    <tr>
                      <td colSpan={7} className="border-t border-line-soft px-5 py-8 text-center text-[13px] text-ink-4">
                        {t.empty}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <AddValue set={data.set.code} groups={groups} onAdded={reload} />
          </>
        )}
      </Card>
    </section>
  )
}
