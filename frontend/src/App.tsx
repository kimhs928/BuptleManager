import { lazy, Suspense } from 'react'
import { LoginRoute } from './pages/login/LoginRoute'
import type { LoginView } from './pages/login/LoginRoute'
import { CompanyPage } from './pages/company/CompanyPage'
import type { CompanyTab } from './pages/company/CompanyPage'
import { MainPage } from './pages/main/MainPage'

// 개발 모드에서만 번들에 포함 (운영 빌드에서는 제외)
const ComponentGallery = import.meta.env.DEV ? lazy(() => import('./pages/ComponentGallery')) : null

const companyTabs: CompanyTab[] = ['basic', 'config', 'users']
const MAIN_HREF = '?main'

const loginViews: LoginView[] = ['login', 'network', 'denied']

/** 임시 진입점: /, /?view=network, /?view=denied, /?main, /?main&notice, /?company, /?company&tab=config, /?company&tab=users, /?gallery */
export default function App() {
  const params = new URLSearchParams(window.location.search)
  if (ComponentGallery && params.has('gallery')) {
    return (
      <Suspense fallback={null}>
        <ComponentGallery />
      </Suspense>
    )
  }
  if (params.has('company')) {
    const tab = companyTabs.find((t) => t === params.get('tab')) ?? 'basic'
    return <CompanyPage initialTab={tab} mainHref={MAIN_HREF} />
  }
  if (params.has('main')) {
    // TODO: 라우터 도입 시 선택한 고객사(schema)를 경로로 전달
    return <MainPage configMismatch={params.has('notice')} onEnter={() => window.location.assign('?company')} />
  }
  const view = params.get('view')
  const initialView = loginViews.find((v) => v === view) ?? 'login'
  return <LoginRoute initialView={initialView} />
}
