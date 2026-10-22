import { useState } from 'react'
import { cn } from '../../lib/cn'
import type { LawsuitHistoryRow } from '../../mocks/lawsuit'
import { texts } from '../../texts'
import { HistoryTimeline } from '../contract/HistoryTimeline'
import type { TimelineRow } from '../contract/HistoryTimeline'
import { HistoryEditModal } from './HistoryEditModal'

const t = texts.lawsuit.history

/** 시안의 카드: 둥근 흰 박스 */
const box = 'rounded-card border border-line bg-surface shadow-card'

/** 소송 히스토리 (BLawsuit_history). 계약 · 자문 히스토리와 같은 타임라인으로 보여 준다 */
export function LawsuitHistory({ rows, onSave }: { rows: LawsuitHistoryRow[]; onSave: (next: LawsuitHistoryRow, ticket: string) => void }) {
  const [includeDeleted, setIncludeDeleted] = useState(true)
  const [editing, setEditing] = useState<LawsuitHistoryRow | null>(null)

  // 소송 히스토리는 단계 이동이 없어서 진행 줄 없이 시간순으로만 보여 준다
  const shown: TimelineRow[] = rows
    .filter((r) => includeDeleted || !r.deleted)
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0))
    .map((r) => ({
      id: r.id,
      action: r.actionText,
      at: r.createdAt,
      deleted: r.deleted,
      comment: [`${t.sender} ${r.name}`, r.subject, r.comment].filter(Boolean).join(' · '),
      from: '',
      to: '',
      user: r.actionUser || t.system,
      stageMove: false,
    }))

  return (
    <section aria-labelledby="lawsuit-history-title" className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3 px-3">
        <h2 id="lawsuit-history-title" className="m-0 text-[13px] font-semibold">
          {t.title}
        </h2>
        <span className="text-xs tabular-nums text-ink-4">{t.count(shown.length)}</span>
      </div>
      <div className={cn(box, 'flex flex-col gap-3.5 px-[22px] py-5')}>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 border-b border-line-soft pb-3.5 text-xs text-ink-4">
          <label className="inline-flex cursor-pointer select-none items-center gap-1.5 text-[12.5px] text-ink">
            <input type="checkbox" checked={includeDeleted} onChange={(e) => setIncludeDeleted(e.target.checked)} className="m-0 size-[15px] accent-primary" />
            {t.includeDeleted}
          </label>
        </div>
        {shown.length === 0 ? (
          <p className="m-0 py-6 text-center text-[13px] text-ink-4">{t.empty}</p>
        ) : (
          <HistoryTimeline lanes={[]} flatRows={shown} latestShown onEdit={(row) => setEditing(rows.find((r) => r.id === row.id) ?? null)} />
        )}
      </div>
      {editing && (
        <HistoryEditModal
          row={editing}
          onClose={() => setEditing(null)}
          onSave={(next, ticket) => {
            onSave(next, ticket)
            setEditing(null)
          }}
        />
      )}
    </section>
  )
}
