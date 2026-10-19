import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'dark' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:brightness-105',
  dark: 'bg-ink-2 text-white hover:brightness-110',
  secondary: 'bg-surface text-ink border border-line-strong hover:bg-hover',
  danger: 'bg-danger text-white hover:brightness-105',
  ghost: 'bg-transparent text-ink-2 hover:bg-fill',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] rounded-ctl',
  md: 'h-[34px] px-[18px] text-[13.5px] rounded-ctl',
  lg: 'h-[46px] px-5 text-[15px] rounded-btn',
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
  block?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  block = false,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition disabled:cursor-default',
        'disabled:bg-fill-strong disabled:text-ink-5 disabled:border-transparent disabled:hover:brightness-100',
        variants[variant],
        sizes[size],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  )
}
