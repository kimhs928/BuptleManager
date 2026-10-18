import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Logo } from '../ui/Logo'

type Props = {
  /** 선택된 고객사. 없으면 "고객사 미선택" */
  company?: string
  userLabel: string
  hasNotice?: boolean
  onBellClick?: () => void
  actions?: ReactNode
}

export function Header({ company, userLabel, hasNotice, onBellClick, actions }: Props) {
  return (
    <header className="flex h-[60px] items-center justify-between gap-4 border-b border-line-strong/60 bg-surface px-8">
      <span className="inline-flex items-center gap-2.5 text-[15px] font-semibold">
        <Logo />
        BuptleManager
        <span className="mx-1 h-4 w-px bg-line-strong" />
        <span className="inline-flex items-center gap-1.5 text-[13px] font-normal text-ink-4">
          <span className={cn('size-[7px] rounded-full', company ? 'bg-success' : 'bg-line-strong')} />
          {company ?? '고객사 미선택'}
        </span>
      </span>
      <span className="inline-flex items-center gap-3.5">
        {actions}
        <button type="button" aria-label="알림" onClick={onBellClick} className="relative inline-flex size-8 items-center justify-center rounded-ctl text-ink-2 hover:bg-fill">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
          {hasNotice && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-danger" />}
        </button>
        <span className="text-xs text-ink-3">{userLabel}</span>
      </span>
    </header>
  )
}
