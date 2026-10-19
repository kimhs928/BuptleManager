import { lazy, Suspense } from 'react'
import { LoginRoute } from './pages/login/LoginRoute'
import type { LoginView } from './pages/login/LoginRoute'
import { MainPage } from './pages/main/MainPage'

// 개발 모드에서만 번들에 포함 (운영 빌드에서는 제외)
const ComponentGallery = import.meta.env.DEV ? lazy(() => import('./pages/ComponentGallery')) : null

const loginViews: LoginView[] = ['login', 'network', 'denied']

/** 임시 진입점: /, /?view=network, /?view=denied, /?main, /?main&notice, /?gallery */
export default function App() {
  const params = new URLSearchParams(window.location.search)
  if (ComponentGallery && params.has('gallery')) {
    return (
      <Suspense fallback={null}>
        <ComponentGallery />
      </Suspense>
    )
  }
  if (params.has('main')) return <MainPage configMismatch={params.has('notice')} />
  const view = params.get('view')
  const initialView = loginViews.find((v) => v === view) ?? 'login'
  return <LoginRoute initialView={initialView} />
}
