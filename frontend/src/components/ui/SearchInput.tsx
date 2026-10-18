import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function SearchInput({ className, ...rest }: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  return (
    <label className={cn('relative block min-w-0 flex-1', className)}>
      <span className="pointer-events-none absolute left-2.5 top-[9px] inline-flex text-ink-4">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16" y2="16" />
        </svg>
      </span>
      <input
        type="search"
        autoComplete="off"
        className="h-[34px] w-full rounded-ctl bg-fill pl-8 pr-3 text-[13px] text-ink placeholder:text-ink-4 focus:shadow-[0_0_0_3px_rgb(35_100_170/0.22)] focus:outline-none"
        {...rest}
      />
    </label>
  )
}
