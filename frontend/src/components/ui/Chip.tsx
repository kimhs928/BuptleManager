import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label: string }

/** 복수 선택 칩 */
export function Chip({ label, checked, className, ...rest }: Props) {
  return (
    <label
      className={cn(
        'inline-flex h-[30px] cursor-pointer items-center gap-1.5 rounded-full border px-2.5 text-xs',
        checked ? 'border-navy bg-primary-soft font-semibold text-navy' : 'border-line-strong bg-surface font-medium text-ink-3',
        className,
      )}
    >
      <input type="checkbox" checked={checked} className="m-0 size-[13px] accent-navy" {...rest} />
      {label}
    </label>
  )
}
