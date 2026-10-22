import { cn } from '../../lib/cn'
import { COUNSEL_STATUS_INFO } from '../../mocks/counsel'
import type { CounselStatus } from '../../mocks/counsel'

/** 자문 단계 점 + 글자. 글자색은 기본 진하게, 삭제된 자문은 흐리게 */
export function StatusDot({ status, muted, className }: { status: CounselStatus; muted?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', muted ? 'text-ink-5' : className)}>
      <span aria-hidden="true" className={cn('size-2 shrink-0 rounded-full', COUNSEL_STATUS_INFO[status].dot, muted && 'opacity-45')} />
      {COUNSEL_STATUS_INFO[status].label}
    </span>
  )
}
