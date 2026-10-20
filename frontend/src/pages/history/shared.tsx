import { cn } from '../../lib/cn'
import type { HistoryType } from '../../mocks/history'

const typeTone: Record<HistoryType, string> = {
  수정: 'bg-warn-soft text-[#7a5800]',
  추가: 'bg-success-soft text-success-ink',
  삭제: 'bg-danger-soft text-danger-ink',
  이관: 'bg-[#f2f2f5] text-ink',
  추출: 'bg-[#f1f0fe] text-nova',
}

/** 작업 유형 칩 */
export function TypeChip({ type }: { type: HistoryType }) {
  return <span className={cn('inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-semibold', typeTone[type])}>{type}</span>
}

/** 작동 기능 칩 */
export function FuncChip({ label }: { label: string }) {
  return <span className="inline-flex items-center whitespace-nowrap rounded-full bg-[#f2f2f5] px-2 py-0.5 text-[11.5px] font-medium text-ink-2">{label}</span>
}
