import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import type { ServicePlatform } from '../../lib/platform'

type Tone = 'neutral' | 'primary' | 'danger' | 'success' | 'warn' | 'biz' | 'nova'

const tones: Record<Tone, string> = {
  neutral: 'bg-fill text-ink-2',
  primary: 'bg-primary-soft text-primary',
  danger: 'bg-danger text-white',
  success: 'bg-success-soft text-success-ink border border-success-line',
  warn: 'bg-warn-soft text-warn-ink border border-warn-line',
  biz: 'bg-biz-soft text-biz-ink border border-biz-line',
  nova: 'bg-nova/10 text-nova',
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-px text-[11px] font-semibold',
        tones[tone],
      )}
    >
      {children}
    </span>
  )
}

/** 서비스 구분 점 (Biz 주황 / Nova 보라) */
export function PlatformDot({ platform }: { platform: ServicePlatform }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block size-[7px] shrink-0 rounded-full',
        platform === 'BUPTLE_BIZ' ? 'bg-biz' : 'bg-nova',
      )}
    />
  )
}
