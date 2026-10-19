import type { ReactNode } from 'react'
import { Button, Lines } from '../../components/ui'
import { texts } from '../../texts'
import { AppIcon, AuthCard, AuthLayout, PlatformFooter } from './AuthLayout'

const t = texts.login.denied

const lock = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
)

type Props = {
  account: { name: string; email: string }
  onRetry: () => void
}

/** 목록 행 구분선 */
function Divider() {
  return <div className="ml-3.5 h-px bg-divider" />
}

function Row({ label, children, mono }: { label: string; children: ReactNode; mono?: boolean }) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-4 px-3.5 text-[13px]">
      <span className="text-ink-3">{label}</span>
      <span className={mono ? 'font-mono text-[12.5px]' : 'text-right'}>{children}</span>
    </div>
  )
}

/** 인증됐으나 미등록 계정 */
export function AccessDeniedPage({ account, onRetry }: Props) {
  return (
    <AuthLayout maxWidth="md">
      <AuthCard className="px-9 pb-7 pt-11">
        <AppIcon size={76} badge={lock} />
        <h1 className="m-0 mt-[26px] text-2xl font-semibold leading-tight tracking-tight">{t.title}</h1>
        <p role="alert" className="m-0 mt-2 text-sm leading-relaxed text-ink-3">
          <Lines lines={t.message} />
        </p>

        <div className="mt-7 w-full rounded-btn bg-bg text-left">
          <div className="flex items-center justify-between gap-4 px-3.5 text-[13px]">
            <span className="flex min-w-0 flex-col gap-0.5 py-2.5">
              <span className="font-semibold">{account.name}</span>
              <span className="text-xs text-ink-4">{account.email} · {t.verified}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-danger-ink">
              <span className="size-[7px] rounded-full bg-danger" />
              {t.noPermission}
            </span>
          </div>
        </div>

        <span className="mb-1.5 ml-3.5 mt-[22px] self-start text-xs font-semibold text-ink-4">{t.requestInfoTitle}</span>
        <div className="w-full overflow-hidden rounded-btn bg-bg text-left">
          <Row label={t.requestInfo.account} mono>
            {account.email}
          </Row>
          <Divider />
          <Row label={t.requestInfo.roleType}>{t.requestInfo.roleTypeValue}</Row>
          <Divider />
          <Row label={t.requestInfo.channel}>{t.requestInfo.channelValue}</Row>
        </div>

        <Button size="lg" block className="mt-7" onClick={() => undefined}>
          {t.requestButton}
        </Button>
        <button type="button" onClick={onRetry} className="mt-3.5 text-[13px] text-link hover:underline">
          {t.retry}
        </button>

        <span className="mt-6 h-px w-full bg-line-soft" />
        <div className="mt-4">
          <PlatformFooter />
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
