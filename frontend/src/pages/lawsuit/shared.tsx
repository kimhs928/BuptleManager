import { cn } from '../../lib/cn'
import { LAWSUIT_STATUS_INFO } from '../../mocks/lawsuit'
import type { LawsuitStatus } from '../../mocks/lawsuit'

/** 소송 상태 점 + 글자. 글자색은 기본 진하게, 삭제된 소송은 흐리게 */
export function StatusDot({ status, muted, className }: { status: LawsuitStatus; muted?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', muted ? 'text-ink-5' : className)}>
      <span aria-hidden="true" className={cn('size-2 shrink-0 rounded-full', LAWSUIT_STATUS_INFO[status].dot, muted && 'opacity-45')} />
      {LAWSUIT_STATUS_INFO[status].label}
    </span>
  )
}
