import { Lines } from '../../components/ui'
import { texts } from '../../texts'
import { AppIcon, AuthCard, AuthLayout, PlatformFooter } from './AuthLayout'

const wifiOff = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="2" y1="2" x2="22" y2="22" />
    <path d="M8.5 16.5a5 5 0 0 1 7 0" />
    <path d="M5 12.9a10 10 0 0 1 5.2-2.8" />
    <path d="M19 12.9a10 10 0 0 0-2.3-1.6" />
    <path d="M2 8.8a15 15 0 0 1 4.2-2.7" />
    <path d="M22 8.8a15 15 0 0 0-11.3-3.7" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
)

const t = texts.login.network

/** 사내망 외 접속 */
export function NetworkBlockedPage() {
  return (
    <AuthLayout networkOk={false}>
      <AuthCard className="px-9 pb-7 pt-11">
        <AppIcon size={76} badge={wifiOff} />
        <h1 className="m-0 mt-[26px] text-2xl font-semibold leading-tight tracking-tight">{texts.common.systemName}</h1>
        <p role="alert" className="m-0 mt-2 text-sm leading-relaxed text-ink-3">
          <Lines lines={t.message} />
          <br />
          <b className="font-semibold text-danger-ink">{t.emphasis}</b>
        </p>
        <span className="mt-7 h-px w-full bg-line-soft" />
        <div className="mt-4">
          <PlatformFooter />
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
