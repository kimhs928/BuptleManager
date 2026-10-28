import { useState } from 'react'
import { ChevronRightIcon, LockIcon } from '../../components/icons'
import { cn } from '../../lib/cn'
import { COUNSEL_GUIDE, MOCK_COUNSEL_HISTORY_USERS } from '../../mocks/counsel'
import type { CounselComment, CounselHistoryRow, CounselWorkflow } from '../../mocks/counsel'
import type { CaseEmail } from '../../mocks/contract'
import { texts } from '../../texts'
import { EmailHistory } from '../contract/EmailHistory'
import { HistoryTimeline } from '../contract/HistoryTimeline'
import type { Lane } from '../contract/HistoryTimeline'
import { HistoryEditModal } from './HistoryEditModal'
import { HistoryNotes } from './HistoryNotes'

const t = texts.counsel.process

/** 시안의 카드: 둥근 흰 박스 */
const box = 'rounded-card border border-line bg-surface shadow-card'

type StageState = 'done' | 'current' | 'pending'

const stageTone: Record<StageState, { card: string; no: string; badge: string }> = {
  done: { card: 'border border-line bg-bg text-ink', no: 'bg-line text-ink-2', badge: 'border border-line bg-[#f2f2f5] text-ink-2' },
  current: { card: 'border-2 border-[#e5a800] bg-[#fff8db] text-ink shadow-[0_0_0_4px_rgba(254,198,1,0.18)]', no: 'bg-[#fec601] text-[#3a2e00]', badge: 'bg-[#fec601] text-[#3a2e00]' },
  pending: { card: 'border border-dashed border-line-strong bg-surface text-ink-3', no: 'bg-[#f2f2f5] text-ink-4', badge: 'bg-[#f2f2f5] text-ink-4' },
}

/** 워크플로우 설정(부서장 승인 등)에 따라 실제로 거치는 프로세스 단계 */
function stagesFor(workflow: CounselWorkflow) {
  const on = (key: string) => !!workflow.attrs.find((a) => a.key === key)?.value.includes('필요')
  return COUNSEL_GUIDE.filter((g) => !g.opt || on(g.opt))
}

/** 시간순 히스토리를 진행 줄로 나눈다. 단계가 되돌아가면 새 줄에서 다시 시작한다 */
function buildLanes(history: CounselHistoryRow[], order: Record<string, number>): Lane<CounselHistoryRow>[] {
  const sorted = [...history].sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0))
  const lanes: Lane<CounselHistoryRow>[] = []
  let lane: Lane<CounselHistoryRow> | null = null
  for (const row of sorted) {
    const back = (order[row.to] ?? 0) < (order[row.from] ?? 0)
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
  if (lastNode?.type === 'node') lastNode.current = true
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
  counselId: string
  workflow: CounselWorkflow
  history: CounselHistoryRow[]
  /** 히스토리에 연결된 코멘트 (본문 · 코멘트 토글에서 보여 준다) */
  comments: CounselComment[]
  emails: CaseEmail[]
  onSaveRow: (next: CounselHistoryRow, changedFields: string[], ticket: string) => void
}

/** 프로세스 · 히스토리 탭 (자문 워크플로우 + 진행 히스토리) */
export function ProcessTab({ counselId, workflow, history, comments, emails, onSaveRow }: Props) {
  const [editingRow, setEditingRow] = useState<CounselHistoryRow | null>(null)

  const guide = stagesFor(workflow)

  // 단계 순서. 워크플로우 변경으로 빠진 단계는 앞 단계 바로 뒤에 둔다
  const order: Record<string, number> = {}
  guide.forEach((g, i) => (order[g.name] = i))
  let lastIdx = -1
  for (const g of COUNSEL_GUIDE) {
    if (order[g.name] !== undefined) lastIdx = order[g.name]
    else order[g.name] = lastIdx + 0.5
  }

  const lanes = buildLanes(history, order)

  // 현재 단계 = 삭제되지 않은 마지막 액션이 도착한 단계
  const live = [...history].filter((h) => !h.deleted).sort((a, b) => (a.at < b.at ? -1 : 1))
  const lastTo = live.at(-1)?.to ?? '초안'
  let currentIndex = guide.findIndex((g) => g.name === lastTo)
  if (currentIndex < 0) {
    currentIndex = guide.findIndex((g) => order[g.name] > (order[lastTo] ?? 0))
    if (currentIndex < 0) currentIndex = guide.length - 1
  }

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="counsel-workflow-title" className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3 px-3">
          <h2 id="counsel-workflow-title" className="m-0 text-[13px] font-semibold">
            {t.workflowTitle}
          </h2>
          <span className="inline-flex items-center gap-[5px] text-xs text-ink-4">
            <LockIcon size={12} />
            <span>{t.readOnly}</span>
          </span>
        </div>

        <div className={cn(box, 'flex flex-col gap-[22px] px-[22px] py-5')}>
          <div className="flex flex-col gap-2.5">
            <h3 className="m-0 text-[13px] font-semibold">{t.processTitle}</h3>
            <ol className="m-0 flex list-none items-stretch gap-1.5 overflow-x-auto p-0">
              {guide.map((g, i) => {
                const state: StageState = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'pending'
                const tone = stageTone[state]
                return (
                  <li key={g.name} className="flex min-w-[150px] flex-1 items-center gap-1.5" aria-current={state === 'current' ? 'step' : undefined}>
                    <div className={cn('flex flex-1 flex-col gap-2 self-stretch rounded-xl p-3', tone.card)}>
                      <span className="flex items-center justify-between gap-1.5">
                        <span className={cn('inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold', tone.no)}>{i + 1}</span>
                        <span className={cn('whitespace-nowrap rounded-full px-[7px] py-px text-[10.5px] font-semibold', tone.badge)}>{t.stateLabel[state]}</span>
                      </span>
                      <span className="text-[13px] font-semibold leading-snug">{g.name}</span>
                      <span className="flex flex-col gap-1 border-t border-line-soft pt-2">
                        {g.people.map((p) => (
                          <span key={p.name} className="flex min-w-0 flex-col gap-px leading-tight">
                            <span className="text-xs font-medium text-ink">{p.name}</span>
                            <span className="text-[11px] text-ink-4">{p.dept}</span>
                          </span>
                        ))}
                      </span>
                    </div>
                    {i < guide.length - 1 && <ChevronRightIcon size={14} aria-hidden="true" className="shrink-0 text-ink-5" />}
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </section>

      <section aria-labelledby="counsel-history-title" className="flex flex-col gap-2">
        <div className="px-3">
          <h2 id="counsel-history-title" className="m-0 text-[13px] font-semibold">
            {t.historyTitle}
          </h2>
        </div>
        <div className={cn(box, 'flex flex-col gap-3.5 px-[22px] py-5')}>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11.5px] text-ink-3">
            <Legend className="rounded-[3px] border border-line-strong bg-surface" label={t.legend.forward} />
            <Legend className="rounded-[3px] border border-[#ffd3c4] bg-[#ffe6de]" label={t.legend.backward} />
            <Legend className="rounded-[3px] border border-danger-line bg-[#fafafb] shadow-[inset_2px_0_0_var(--color-danger)]" label={t.legend.deleted} />
            <Legend className="rounded-full border-2 border-[#e5a800] bg-[#fff8db]" label={t.legend.current} />
          </div>

          <HistoryTimeline lanes={lanes} latestShown stageOrder={order} onEdit={setEditingRow} renderBody={(row) => <HistoryNotes row={row} counselId={counselId} comments={comments} />} />
        </div>
      </section>

      <EmailHistory emails={emails} />

      {editingRow && (
        <HistoryEditModal
          row={editingRow}
          users={MOCK_COUNSEL_HISTORY_USERS}
          onClose={() => setEditingRow(null)}
          onSave={(next, fields, ticket) => {
            onSaveRow(next, fields, ticket)
            setEditingRow(null)
          }}
        />
      )}
    </div>
  )
}
