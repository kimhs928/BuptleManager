import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { SearchIcon } from '../icons'

export function SearchInput({ className, ...rest }: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  return (
    <label className={cn('relative block min-w-0 flex-1', className)}>
      <span className="pointer-events-none absolute left-2.5 top-[9px] inline-flex text-ink-4">
        <SearchIcon size={15} strokeWidth={2.2} />
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
