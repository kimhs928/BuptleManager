import { cn } from '../../lib/cn'
import type { CounselStatus } from '../../mocks/counsel'

const statusDot: Record<CounselStatus, string> = {
  접수: 'bg-ink-5',
  검토중: 'bg-[#fec601]',
  답변완료: 'bg-[#3da5d9]',
  종결: 'bg-success',
}

/** 자문 단계 점 + 글자. 글자색은 기본 진하게, 삭제된 자문은 흐리게 */
export function StatusDot({ status, muted, className }: { status: CounselStatus; muted?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', muted ? 'text-ink-5' : className)}>
      <span aria-hidden="true" className={cn('size-2 shrink-0 rounded-full', statusDot[status], muted && 'opacity-45')} />
      {status}
    </span>
  )
}
