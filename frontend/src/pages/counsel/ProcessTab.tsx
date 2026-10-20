import { useState } from 'react'
import { ArrowRightIcon, ChevronRightIcon, EditIcon, LockIcon, UndoIcon } from '../../components/icons'
import { cn } from '../../lib/cn'
import { COUNSEL_GUIDE, MOCK_COUNSEL_HISTORY_USERS } from '../../mocks/counsel'
import type { CounselHistoryRow, CounselWorkflow } from '../../mocks/counsel'
import { texts } from '../../texts'
import { DeletedBadge } from '../contract/shared'
import { HistoryEditModal } from './HistoryEditModal'

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

type Item = { type: 'node'; name: string; current: boolean } | { type: 'edge'; row: CounselHistoryRow; back: boolean }
type Lane = { back: boolean; items: Item[] }

/** 시간순 히스토리를 진행 줄로 나눈다. 단계가 되돌아가면 새 줄에서 다시 시작한다 */
function buildLanes(history: CounselHistoryRow[], order: Record<string, number>): Lane[] {
  const sorted = [...history].sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0))
  const lanes: Lane[] = []
  let lane: Lane | null = null
  for (const row of sorted) {
    const back = (order[row.to] ?? 0) < (order[row.from] ?? 0)
    if (!lane || back) {
      lane = { back, items: [] }
      lanes.push(lane)
      if (!back) lane.items.push({ type: 'node', name: row.from, current: false })
    }
    lane.items.push({ type: 'edge', row, back })
    lane.items.push({ type: 'node', name: row.to, current: false })
  }
  const last = lanes.at(-1)?.items.at(-1)
  if (last?.type === 'node') last.current = true
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

function HistoryCard({ row, back, onEdit }: { row: CounselHistoryRow; back: boolean; onEdit: () => void }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1">
      <ArrowRightIcon size={16} className="shrink-0 text-ink-5" />
      <span
        className={cn(
          'flex w-[200px] shrink-0 flex-col gap-1.5 rounded-[10px] px-3 py-2.5',
          row.deleted ? 'border border-danger-line bg-[#fafafb] shadow-[inset_3px_0_0_var(--color-danger)]' : back ? 'border border-[#ffd3c4] bg-[#ffe6de]' : 'border border-divider bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
        )}
      >
        <span className="flex items-center justify-between gap-1.5">
          <span className={cn('flex min-w-0 items-center gap-[5px] text-xs font-semibold', back ? 'text-[#c23b22]' : 'text-ink')}>
            {back && <UndoIcon size={13} className="shrink-0" />}
            <span className={cn('truncate', row.deleted && 'text-ink-4 line-through decoration-danger decoration-[1.5px]')}>{row.action}</span>
            {row.deleted && <DeletedBadge label={t.deleted} />}
          </span>
          <button type="button" aria-label={t.editLabel(row.action)} title={t.editLabel(row.action)} onClick={onEdit} className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-ctl bg-primary text-white hover:brightness-105">
            <EditIcon size={14} />
          </button>
        </span>
        <span className="whitespace-nowrap text-[11px] tabular-nums text-ink-3">
          {row.user} · {row.at}
        </span>
        <span className={cn('flex min-w-0 items-center gap-[5px] rounded-md px-2 py-1 text-[11.5px] font-semibold text-ink-2', back && !row.deleted ? 'bg-white/75' : 'bg-[#f2f2f5]')}>
          <span className="truncate">{row.from}</span>
          <ArrowRightIcon size={12} strokeWidth={2.6} className="shrink-0" />
          <span className="truncate">{row.to}</span>
        </span>
        <span className="flex flex-col gap-0.5 border-t border-line-soft pt-1.5">
          <span className="text-[10px] font-semibold text-ink-4">{t.comment}</span>
          <span className="text-[11px] leading-[1.45] text-ink-2">{row.comment}</span>
        </span>
      </span>
      <ArrowRightIcon size={16} className="shrink-0 text-ink-5" />
    </span>
  )
}

type Props = {
  workflow: CounselWorkflow
  history: CounselHistoryRow[]
  onSaveRow: (next: CounselHistoryRow, changedFields: string[], ticket: string) => void
}

/** 프로세스 · 히스토리 탭 (자문 워크플로우 + 진행 히스토리) */
export function ProcessTab({ workflow, history, onSaveRow }: Props) {
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
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="m-0 text-[13px] font-semibold">{t.settingTitle}</h3>
            </div>
            <dl className="m-0 grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-px overflow-hidden rounded-xl border border-line-soft bg-line-soft">
              {workflow.attrs.map((a) => (
                <div key={a.key} className="grid grid-cols-[148px_minmax(0,1fr)] bg-surface">
                  <dt className="flex items-center bg-[#fafafb] px-3.5 py-2.5 text-[12.5px] font-medium text-ink-3">{a.label}</dt>
                  <dd className="m-0 flex flex-wrap items-center gap-1 px-3 py-2">
                    {a.value.map((v) => (
                      <span key={v} className="inline-flex h-6 items-center rounded-md bg-[#f2f2f5] px-[9px] text-xs font-medium text-ink">
                        {v}
                      </span>
                    ))}
                    {a.value.length === 0 && <span className="text-xs text-ink-5">{t.empty}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

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

          <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
            {lanes.map((lane, i) => {
              const last = i === lanes.length - 1
              return (
                <li key={i} className={cn('flex min-w-0 flex-col gap-2.5 rounded-xl px-3.5 py-3', last ? 'border-[1.5px] border-[#e5a800] bg-surface shadow-[0_0_0_3px_rgba(254,198,1,0.16)]' : 'border border-line-soft bg-[#fafafb]')}>
                  <span className={cn('text-[11.5px] font-semibold', last ? 'text-[#9a6b00]' : 'text-ink-3')}>{t.laneLabel(i + 1, last)}</span>
                  <div className="flex min-w-0 flex-nowrap items-center gap-1 overflow-x-auto pb-1.5">
                    {lane.items.map((it, j) =>
                      it.type === 'node' ? (
                        <span
                          key={j}
                          className={cn(
                            'box-border inline-flex h-[30px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-xs font-semibold',
                            it.current ? 'border-2 border-[#e5a800] bg-[#fff8db] shadow-[0_0_0_3px_rgba(254,198,1,0.22)]' : 'border border-divider bg-[#f2f2f5] text-ink',
                          )}
                        >
                          {it.name}
                          {it.current && <span className="rounded-full bg-[#fec601] px-1.5 py-px text-[10px] font-bold text-[#3a2e00]">{t.current}</span>}
                        </span>
                      ) : (
                        <HistoryCard key={j} row={it.row} back={it.back} onEdit={() => setEditingRow(it.row)} />
                      ),
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

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
