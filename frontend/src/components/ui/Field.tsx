import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

const control =
  'w-full rounded-ctl border border-line-strong bg-surface px-3 text-[13px] text-ink placeholder:text-ink-5 focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_rgb(35_100_170/0.22)]'

type FieldProps = {
  label: string
  required?: boolean
  readOnlyHint?: boolean
  hint?: string
  className?: string
  children: (id: string) => ReactNode
}

/** label + control 한 세트. children 에 id 를 넘겨 label 과 연결한다. */
export function Field({ label, required, readOnlyHint, hint, className, children }: FieldProps) {
  const id = useId()
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="inline-flex items-center gap-2 text-xs font-medium text-ink-2">
        {label}
        {required && <span className="text-danger-ink">*</span>}
        {readOnlyHint && <span className="text-[11px] font-normal text-ink-4">읽기 전용</span>}
      </label>
      {children(id)}
      {hint && <span className="text-[11px] text-ink-4">{hint}</span>}
    </div>
  )
}

export function TextInput({ className, readOnly, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      readOnly={readOnly}
      className={cn(control, 'h-[38px]', readOnly && 'cursor-not-allowed border-line bg-bg text-ink-3', className)}
      {...rest}
    />
  )
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(control, 'h-[38px]', className)} {...rest}>
      {children}
    </select>
  )
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, 'py-2.5 leading-normal', className)} {...rest} />
}
