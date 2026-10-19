import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type SegmentOption<T extends string> = { value: T; label: string; leading?: ReactNode }

type Props<T extends string> = {
  options: SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  label: string
}

export function SegmentedControl<T extends string>({ options, value, onChange, label }: Props<T>) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex rounded-ctl bg-fill-strong p-0.5">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'inline-flex h-[26px] items-center gap-[7px] rounded-md px-3.5 text-[13px] font-medium',
              active ? 'bg-surface text-ink shadow-seg' : 'text-ink-2',
            )}
          >
            {o.leading}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
