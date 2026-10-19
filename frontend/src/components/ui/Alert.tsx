import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Tone = 'info' | 'warn' | 'danger'

const tones: Record<Tone, string> = {
  info: 'bg-primary-soft border-primary/20 text-primary',
  warn: 'bg-warn-soft border-warn-line text-warn-ink',
  danger: 'bg-danger-soft border-danger-line text-danger-ink',
}

const icons: Record<Tone, ReactNode> = {
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </>
  ),
  warn: (
    <>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  ),
  danger: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </>
  ),
}

/** 안내 박스 (정보/주의/경고) */
export function Alert({ tone = 'info', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'note'}
      className={cn('flex items-start gap-2 rounded-[10px] border px-3 py-2.5 text-xs leading-normal', tones[tone], className)}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-px shrink-0">
        {icons[tone]}
      </svg>
      <span className="text-left">{children}</span>
    </div>
  )
}
