import { Alert, Button } from '../../components/ui'
import { texts } from '../../texts'
import { AppIcon, AuthCard, AuthLayout, PlatformFooter } from './AuthLayout'

const t = texts.login

type Props = {
  busy: boolean
  error?: string
  onLogin: () => void
}

export function LoginPage({ busy, error, onLogin }: Props) {
  return (
    <AuthLayout>
      <AuthCard className="px-11 pb-9 pt-12">
        <AppIcon size={88} />
        <h1 className="m-0 mt-7 text-[26px] font-bold leading-tight tracking-tight">{t.title}</h1>
        <p className="m-0 mt-2 text-[15px] leading-normal text-ink-3">{t.subtitle}</p>

        {error && (
          <Alert tone="danger" className="mt-6 w-full">
            {error}
          </Alert>
        )}

        <Button
          size="lg"
          block
          loading={busy}
          onClick={onLogin}
          className="mt-8"
          icon={
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          }
        >
          {busy ? t.buttonBusy : t.button}
        </Button>
        <p className="m-0 mt-3.5 text-xs leading-relaxed text-ink-4">{t.redirectHint}</p>

        <span className="mt-7 h-px w-full bg-line-soft" />
        <p className="m-0 mt-5 text-[13px] text-ink-3">
          {t.noAccess.prefix}{' '}
          <a href="#request" className="font-medium text-link hover:underline">
            {t.noAccess.link}
          </a>
        </p>
      </AuthCard>
      <div className="mt-[18px]">
        <PlatformFooter />
      </div>
    </AuthLayout>
  )
}
