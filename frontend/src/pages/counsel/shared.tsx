import { cn } from '../../lib/cn'
import { useEnumLabels } from '../../hooks/useEnumLabels'
import type { CounselStatus } from '../../mocks/counsel'

/** 상태가 속한 enum 분류(CNS_GRP_*)별 점 색. 분류를 못 찾으면 회색 */
const GROUP_DOT: Record<string, string> = {
  CNS_GRP_DRAFT: 'bg-ink-5',
  CNS_GRP_DEPT: 'bg-[#fec601]',
  CNS_GRP_ASSIGN: 'bg-[#fec601]',
  CNS_GRP_REVIEW: 'bg-[#fec601]',
  CNS_GRP_CIRCULATION: 'bg-[#3da5d9]',
  CNS_GRP_FINAL: 'bg-[#fec601]',
  CNS_GRP_DONE: 'bg-success',
  CNS_GRP_STOP: 'bg-ink-3',
}

/** 자문 단계 점 + 글자. 글자색은 기본 진하게, 삭제된 자문은 흐리게 */
export function StatusDot({ status, muted, className }: { status: CounselStatus; muted?: boolean; className?: string }) {
  const { label, group } = useEnumLabels('BIZ_COUNSEL_STATUS')
  return (
    <span className={cn('inline-flex items-center gap-1.5', muted ? 'text-ink-5' : className)}>
      <span aria-hidden="true" className={cn('size-2 shrink-0 rounded-full', GROUP_DOT[group(status)] ?? 'bg-ink-5', muted && 'opacity-45')} />
      {label(status)}
    </span>
  )
}
