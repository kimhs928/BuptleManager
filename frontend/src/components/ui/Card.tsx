import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-card border border-line bg-surface shadow-card', className)} {...rest} />
}

/** 섹션 라벨 */
export function SectionLabel({ children }: { children: ReactNode }) {
  return <span className="px-3 text-[11px] font-semibold text-ink-4">{children}</span>
}
