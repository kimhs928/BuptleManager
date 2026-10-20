import { cn } from '../../lib/cn'
import type { LawsuitStatus } from '../../mocks/lawsuit'

const statusDot: Record<LawsuitStatus, string> = {
  접수: 'bg-ink-5',
  진행중: 'bg-[#3da5d9]',
  '판결 대기': 'bg-[#fec601]',
  종결: 'bg-success',
}

/** 소송 상태 점 + 글자. 글자색은 기본 진하게, 삭제된 소송은 흐리게 */
export function StatusDot({ status, muted, className }: { status: LawsuitStatus; muted?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', muted ? 'text-ink-5' : className)}>
      <span aria-hidden="true" className={cn('size-2 shrink-0 rounded-full', statusDot[status], muted && 'opacity-45')} />
      {status}
    </span>
  )
}
