import { WifiOffIcon } from '../../components/icons'
import { Lines } from '../../components/ui'
import { texts } from '../../texts'
import { AppIcon, AuthCard, AuthLayout, PlatformFooter } from './AuthLayout'

const wifiOff = <WifiOffIcon size={15} strokeWidth={2.4} />

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
