import type { ReactNode } from 'react'
import { texts } from '../../texts'
import { Badge } from './Badge'
import { Button } from './Button'

type Props = {
  title: string
  count?: string
  children: ReactNode
  onDismiss?: () => void
  actionLabel: string
  onAction: () => void
}

/** 상단 긴급 알림 */
export function NoticeBanner({ title, count, children, onDismiss, actionLabel, onAction }: Props) {
  return (
    <div
      role="alert"
      className="flex w-full flex-wrap items-center gap-3.5 rounded-card border border-danger-line bg-danger-soft py-3.5 pl-[18px] pr-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-18px_rgba(255,59,48,0.35)]"
    >
      <span className="relative size-2 shrink-0 rounded-full bg-danger shadow-[0_0_0_4px_rgb(255_59_48/0.18)]">
        <span aria-hidden="true" className="absolute -inset-1 animate-pulse-ring rounded-full border-[1.5px] border-danger/55" />
      </span>
      <span className="flex min-w-[280px] flex-1 flex-col gap-[3px] leading-snug">
        <span className="flex flex-wrap items-center gap-2">
          <b className="text-[13.5px] font-semibold text-danger-ink">{title}</b>
          {count && <Badge tone="danger">{count}</Badge>}
        </span>
        <span className="text-[13px] text-danger-text">{children}</span>
      </span>
      {onDismiss && (
        <Button variant="secondary" size="sm" onClick={onDismiss} className="border-danger-line text-danger-muted">
          {texts.common.notice.later}
        </Button>
      )}
      <Button variant="danger" size="sm" onClick={onAction} className="font-semibold">
        {actionLabel}
      </Button>
    </div>
  )
}
