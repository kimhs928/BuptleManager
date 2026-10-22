import { useState } from 'react'
import { Select } from '../../components/ui'
import { cn } from '../../lib/cn'
import { STAGE_ORDER } from '../../mocks/contract'
import type { ContractEmail, HistoryRow } from '../../mocks/contract'
import { texts } from '../../texts'
import { EmailHistory } from './EmailHistory'
import { HistoryExtraModal } from './HistoryExtraModal'
import { HistoryEditModal } from './HistoryEditModal'
import { HistoryTimeline } from './HistoryTimeline'
import type { Lane } from './HistoryTimeline'

const t = texts.contract.history

/** 시안의 카드: 둥근 흰 박스 */
const box = 'rounded-card border border-line bg-surface shadow-card'

/** 시간순 히스토리를 진행 줄로 나눈다. 단계가 되돌아가면 새 줄에서 다시 시작한다 */
function buildLanes(history: HistoryRow[], latest: boolean): Lane[] {
  const sorted = [...history].sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0))
  const lanes: Lane[] = []
  let lane: Lane | null = null
  for (const row of sorted) {
    const back = (STAGE_ORDER[row.to] ?? 0) < (STAGE_ORDER[row.from] ?? 0)
    if (!lane || back) {
      lane = { back, items: [] }
      lanes.push(lane)
      if (!back) lane.items.push({ type: 'node', name: row.from, current: false })
    }
    lane.items.push({ type: 'edge', row, back })
    // 단계 이동 여부는 서버가 내려준 stageMove 로 구분한다
    if (row.stageMove) lane.items.push({ type: 'node', name: row.to, current: false })
  }
  const lastNode = lanes.at(-1)?.items.findLast((it) => it.type === 'node')
  // 조건으로 걸러 낸 경우 마지막 칸이 실제 현재 단계가 아닐 수 있다
  if (lastNode?.type === 'node' && latest) lastNode.current = true
  return lanes
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true" className={cn('h-2.5 w-3.5', className)} />
      {label}
    </span>
  )
}

type Props = {
  history: HistoryRow[]
  emails: ContractEmail[]
  members: string[]
  onSaveRow: (next: HistoryRow, ticket: string) => void
}

/** 계약 진행 히스토리 · 이메일 발송 내역 */
export function HistoryTab({ history, emails, members, onSaveRow }: Props) {
  const [editing, setEditing] = useState<HistoryRow | null>(null)
  const [detail, setDetail] = useState<HistoryRow | null>(null)
  // 검색 조건. 삭제된 히스토리는 기본으로 포함한다
  const [includeDeleted, setIncludeDeleted] = useState(true)
  const [docOnly, setDocOnly] = useState(false)
  const [userFilter, setUserFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')

  const byTime = [...history].sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0))
  const users = [...new Set(byTime.map((r) => r.user))]
  const actions = [...new Set(byTime.map((r) => r.action))]
  const filtered = history.filter(
    (r) => (includeDeleted || !r.deleted) && (!docOnly || !!r.extra.docId) && (!userFilter || r.user === userFilter) && (!actionFilter || r.action === actionFilter),
  )
  // 삭제 포함 여부 외의 조건을 쓰면 진행 줄 없이 이력을 시간순 한 줄로 보여 준다
  const flat = docOnly || !!userFilter || !!actionFilter
  const flatRows = [...filtered].sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0))
  const filtering = !includeDeleted || docOnly || !!userFilter || !!actionFilter
  const latestShown = !filtering || filtered.some((r) => r === byTime.at(-1))
  const lanes = buildLanes(filtered, latestShown)
  const reset = () => {
    setIncludeDeleted(true)
    setDocOnly(false)
    setUserFilter('')
    setActionFilter('')
  }

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="history-title" className="flex flex-col gap-2">
        <div className="px-3">
          <h2 id="history-title" className="m-0 text-[13px] font-semibold">
            {t.title}
          </h2>
        </div>
        <div className={cn(box, 'flex flex-col gap-3.5 px-[22px] py-5')}>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 border-b border-line-soft pb-3.5 text-xs text-ink-4">
            <label className="inline-flex cursor-pointer select-none items-center gap-1.5 text-[12.5px] text-ink">
              <input type="checkbox" checked={includeDeleted} onChange={(e) => setIncludeDeleted(e.target.checked)} className="m-0 size-[15px] accent-primary" />
              {t.filter.deleted}
            </label>
            <span aria-hidden="true" className="h-3 w-px bg-line-strong" />
            <label className="inline-flex cursor-pointer select-none items-center gap-1.5 text-[12.5px] text-ink">
              <input type="checkbox" checked={docOnly} onChange={(e) => setDocOnly(e.target.checked)} className="m-0 size-[15px] accent-primary" />
              {t.filter.docOnly}
            </label>
            <span aria-hidden="true" className="h-3 w-px bg-line-strong" />
            <label className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap">
              {t.filter.user}
              <Select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="h-8 w-auto min-w-[130px] text-[12.5px]">
                <option value="">{t.filter.all}</option>
                {users.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </Select>
            </label>
            <span aria-hidden="true" className="h-3 w-px bg-line-strong" />
            <label className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap">
              {t.filter.action}
              <Select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="h-8 w-auto min-w-[150px] text-[12.5px]">
                <option value="">{t.filter.all}</option>
                {actions.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </Select>
            </label>
            <span className="ml-auto inline-flex items-center gap-3">
              <span className="tabular-nums">{t.filter.count(filtered.length, history.length)}</span>
              {filtering && (
                <button type="button" onClick={reset} className="h-7 rounded-[7px] border border-line-strong bg-surface px-2.5 text-xs font-medium text-ink hover:bg-hover">
                  {t.filter.reset}
                </button>
              )}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11.5px] text-ink-3">
            <Legend className="rounded-[3px] border border-line-strong bg-surface" label={t.legend.forward} />
            <Legend className="rounded-[3px] border border-[#ffd3c4] bg-[#ffe6de]" label={t.legend.backward} />
            <Legend className="rounded-[3px] border border-danger-line bg-[#fafafb] shadow-[inset_2px_0_0_var(--color-danger)]" label={t.legend.deleted} />
            <Legend className="rounded-full border-2 border-[#e5a800] bg-[#fff8db]" label={t.legend.current} />
          </div>

          {(flat ? flatRows.length === 0 : lanes.length === 0) && <p className="m-0 py-6 text-center text-[13px] text-ink-4">{t.filter.empty}</p>}
          <HistoryTimeline lanes={lanes} flatRows={flat ? flatRows : null} latestShown={latestShown} onEdit={setEditing} onDetail={setDetail} />
        </div>
      </section>

      <EmailHistory emails={emails} />

      {editing && (
        <HistoryEditModal
          row={editing}
          users={members}
          onClose={() => setEditing(null)}
          onSave={(next, ticket) => {
            onSaveRow(next, ticket)
            setEditing(null)
          }}
        />
      )}
      {detail && <HistoryExtraModal row={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}
