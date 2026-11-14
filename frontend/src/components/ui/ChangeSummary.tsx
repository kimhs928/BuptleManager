import { cn } from '../../lib/cn'
import { texts } from '../../texts'

/** before가 없으면 새로 입력한 값만 보여 준다 */
/** reset 이 있으면 이 항목만 처음 값으로 되돌리는 버튼을 보여 준다 */
export type Change = { field: string; before?: string; after: string; reset?: () => void }

/** 변경 전/후 요약 */
const t = texts.common.editModal.changes

const resetButton = 'shrink-0 rounded-md border border-danger-line bg-surface px-2 py-0.5 text-[11px] font-semibold text-danger-ink hover:bg-danger-soft'

export function ChangeSummary({
  changes,
  title = t.title,
  emptyText = t.empty,
  onResetAll,
}: {
  changes: Change[]
  title?: string
  emptyText?: string
  /** 있으면 변경 항목이 있을 때 전체 초기화 버튼을 보여 준다 */
  onResetAll?: () => void
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-danger-line bg-danger-soft p-3.5">
      <span className="inline-flex items-center gap-2 text-xs font-semibold text-danger-ink">
        {title}
        <span className="rounded-full bg-danger-ink px-2 py-px text-[11px] font-semibold text-white">{changes.length}</span>
        {onResetAll && changes.length > 0 && (
          <button type="button" onClick={onResetAll} className={cn(resetButton, 'ml-auto')}>
            {t.resetAll}
          </button>
        )}
      </span>
      {changes.length === 0 ? (
        <span className="rounded-[10px] border border-dashed border-danger-line bg-surface/60 px-3 py-2.5 text-[13px] text-danger-text">
          {emptyText}
        </span>
      ) : (
        changes.map((c) => (
          <span key={c.field} className="flex flex-col gap-0.5 rounded-[10px] border border-danger-line bg-surface px-3 py-2 text-xs">
            <span className="flex items-center justify-between gap-2">
              <span className="font-semibold text-ink-2">{c.field}</span>
              {c.reset && (
                <button type="button" onClick={c.reset} aria-label={t.resetLabel(c.field)} className={resetButton}>
                  {t.reset}
                </button>
              )}
            </span>
            {c.before === undefined ? (
              <span className="font-semibold text-danger-ink">{c.after}</span>
            ) : (
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-ink-4 line-through">{c.before}</span>
                <span className="text-ink-4">→</span>
                <span className="font-semibold text-danger-ink">{c.after}</span>
              </span>
            )}
          </span>
        ))
      )}
    </div>
  )
}
