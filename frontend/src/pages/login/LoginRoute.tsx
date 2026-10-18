import { useEffect, useRef, useState } from 'react'
import { MOCK_ACCOUNT, MOCK_LOGIN_DELAY_MS } from '../../mocks/auth'
import { AccessDeniedPage } from './AccessDeniedPage'
import { LoginPage } from './LoginPage'
import { NetworkBlockedPage } from './NetworkBlockedPage'

export type LoginView = 'login' | 'network' | 'denied'

/** 로그인 흐름 (현재 목 동작) */
export function LoginRoute({ initialView = 'login' }: { initialView?: LoginView }) {
  const [view, setView] = useState<LoginView>(initialView)
  const [busy, setBusy] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const login = () => {
    if (busy) return
    setBusy(true)
    timer.current = window.setTimeout(() => {
      setBusy(false)
      setView('denied')
    }, MOCK_LOGIN_DELAY_MS)
  }

  if (view === 'network') return <NetworkBlockedPage />
  if (view === 'denied') return <AccessDeniedPage account={MOCK_ACCOUNT} onRetry={() => setView('login')} />
  return <LoginPage busy={busy} onLogin={login} />
}
