import type { ReactNode } from 'react'

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-line-strong)" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16" y2="16" />
      </svg>
      <p className="m-0 text-sm font-semibold text-ink-2">{title}</p>
      {description && <p className="m-0 text-[13px] text-ink-4">{description}</p>}
      {action}
    </div>
  )
}
