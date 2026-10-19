import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import type { ServicePlatform } from '../../lib/platform'
import { platformLabel } from '../../lib/platform'
import { texts } from '../../texts'
import { Footer } from '../../components/layout/Footer'
import { Logo, PlatformDot } from '../../components/ui'

const platforms = Object.keys(platformLabel) as ServicePlatform[]

type Props = {
  networkOk?: boolean
  maxWidth?: 'sm' | 'md'
  children: ReactNode
}

export function AuthLayout({ networkOk = true, maxWidth = 'sm', children }: Props) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-bg">
      <header className="flex h-16 items-center justify-between px-9">
        <span className="inline-flex items-center gap-2.5 text-[15px] font-semibold">
          <Logo />
          {texts.common.appName}
        </span>
        <span className="inline-flex h-[30px] items-center gap-2 rounded-full border border-line-strong/60 bg-surface px-3 text-xs text-ink-3">
          <span className={cn('size-[7px] rounded-full', networkOk ? 'bg-success' : 'bg-danger')} />
          {texts.common.network.internalOnly}
        </span>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pb-14 pt-6">
        <div className={cn('flex w-full flex-col', maxWidth === 'sm' ? 'max-w-[420px]' : 'max-w-[440px]')}>{children}</div>
      </main>

      <Footer className="pb-7" />
    </div>
  )
}

/** 로그인 카드 */
export function AuthCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section
      className={cn(
        'box-border flex w-full flex-col items-center rounded-panel border border-line bg-surface text-center shadow-panel',
        className,
      )}
    >
      {children}
    </section>
  )
}

/** 앱 아이콘 (badge: 우하단 원형 배지) */
export function AppIcon({ size, badge }: { size: number; badge?: ReactNode }) {
  return (
    <span className="relative inline-flex">
      <Logo size={size} shadow />
      {badge && (
        <span className="absolute -bottom-1.5 -right-2 inline-flex size-8 items-center justify-center rounded-full border-[3px] border-surface bg-danger text-white">
          {badge}
        </span>
      )}
    </span>
  )
}

/** 하단 서비스 표기 */
export function PlatformFooter() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3.5 text-xs text-ink-4">
      {platforms.map((p) => (
        <span key={p} className="inline-flex items-center gap-1.5">
          <PlatformDot platform={p} />
          {platformLabel[p]}
        </span>
      ))}
      <span>{texts.common.consoleLabel}</span>
    </div>
  )
}
