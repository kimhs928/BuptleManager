export type Change = { field: string; before: string; after: string }

/** 수정 모달 우측: 변경 전 → 변경 후 요약 */
export function ChangeSummary({ changes }: { changes: Change[] }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-danger-line bg-danger-soft p-3.5">
      <span className="inline-flex items-center gap-2 text-xs font-semibold text-danger-ink">
        변경 항목
        <span className="rounded-full bg-danger-ink px-2 py-px text-[11px] font-semibold text-white">{changes.length}</span>
      </span>
      {changes.length === 0 ? (
        <span className="rounded-[10px] border border-dashed border-danger-line bg-surface/60 px-3 py-2.5 text-[13px] text-danger-text">
          아직 변경한 항목이 없습니다.
        </span>
      ) : (
        changes.map((c) => (
          <span key={c.field} className="flex flex-col gap-0.5 rounded-[10px] border border-danger-line bg-surface px-3 py-2 text-xs">
            <span className="font-semibold text-ink-2">{c.field}</span>
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-ink-4 line-through">{c.before}</span>
              <span className="text-ink-4">→</span>
              <span className="font-semibold text-danger-ink">{c.after}</span>
            </span>
          </span>
        ))
      )}
    </div>
  )
}
