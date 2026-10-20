import type { ReactNode } from 'react'
import { TrashIcon } from '../../components/icons'
import { cn } from '../../lib/cn'
import type { ContractStatus } from '../../mocks/contract'

const statusTone: Record<ContractStatus, string> = {
  작성중: 'bg-[#f2f2f5] text-ink-3',
  검토중: 'bg-warn-soft text-warn-ink',
  '서명 진행중': 'bg-[#f2f2f5] text-ink',
  '체결 완료': 'bg-success-soft text-success-ink',
  반려: 'bg-danger-soft text-danger-ink',
}

const statusDot: Record<ContractStatus, string> = {
  작성중: 'bg-ink-5',
  검토중: 'bg-[#fec601]',
  '서명 진행중': 'bg-[#3da5d9]',
  '체결 완료': 'bg-success',
  반려: 'bg-danger',
}

/** 계약 진행 상태 칩 */
export function StatusChip({ status }: { status: ContractStatus }) {
  return <span className={cn('inline-flex items-center rounded-full px-[9px] py-[3px] text-[11px] font-semibold', statusTone[status])}>{status}</span>
}

/** 계약 진행 상태 점 + 글자. 글자색은 기본 진하게, 삭제된 계약은 흐리게 */
export function StatusDot({ status, muted, className }: { status: ContractStatus; muted?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', muted ? 'text-ink-5' : className)}>
      <span aria-hidden="true" className={cn('size-2 shrink-0 rounded-full', statusDot[status], muted && 'opacity-45')} />
      {status}
    </span>
  )
}

/** 섹션 제목 줄 (제목 + 우측 동작) */
export function SectionHead({ id, title, children }: { id: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3">
      <h2 id={id} className="m-0 text-[13px] font-semibold">
        {title}
      </h2>
      {children}
    </div>
  )
}

/** 삭제된 항목 표시 배지 */
export function DeletedBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-danger-line bg-danger-soft px-2 py-0.5 text-[11px] font-semibold text-danger-ink">
      <TrashIcon size={11} strokeWidth={2.2} />
      {label}
    </span>
  )
}
