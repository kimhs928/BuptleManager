import { lazy, Suspense } from 'react'
import { LoginRoute } from './pages/login/LoginRoute'
import type { LoginView } from './pages/login/LoginRoute'
import { CompanyPage } from './pages/company/CompanyPage'
import { ConfigManagePage } from './pages/configManage/ConfigManagePage'
import { ContractDetailPage } from './pages/contract/ContractDetailPage'
import type { ContractTab } from './pages/contract/ContractDetailPage'
import { ContractSearchPage } from './pages/contract/ContractSearchPage'
import { CounselDetailPage } from './pages/counsel/CounselDetailPage'
import type { CounselTab } from './pages/counsel/CounselDetailPage'
import { CounselSearchPage } from './pages/counsel/CounselSearchPage'
import { AdminPage } from './pages/admin/AdminPage'
import { HistoryPage } from './pages/history/HistoryPage'
import { LawsuitDetailPage } from './pages/lawsuit/LawsuitDetailPage'
import type { LawsuitTab } from './pages/lawsuit/LawsuitDetailPage'
import { LawsuitSearchPage } from './pages/lawsuit/LawsuitSearchPage'
import { ReportPage } from './pages/report/ReportPage'
import type { CompanyTab } from './pages/company/CompanyPage'
import { loadSelectedCompany, syncCompanyToUrl } from './lib/selectedCompany'
import { MainPage } from './pages/main/MainPage'
import { UserListPage } from './pages/user/UserListPage'
import { UserTransferPage } from './pages/user/UserTransferPage'

// 개발 모드에서만 번들에 포함 (운영 빌드에서는 제외)
const ComponentGallery = import.meta.env.DEV ? lazy(() => import('./pages/ComponentGallery')) : null

const companyTabs: CompanyTab[] = ['basic', 'config', 'users']
const contractTabs: ContractTab[] = ['basic', 'members', 'workflow']

const counselTabs: CounselTab[] = ['basic', 'members', 'process', 'comments']
const lawsuitTabs: LawsuitTab[] = ['basic', 'members', 'emails']

const loginViews: LoginView[] = ['login', 'network', 'denied']

/**
 * 임시 진입점 (라우터 도입 전). 주소 경로로 화면을 고른다:
 * /, /?view=network, /?view=denied, /main, /main?notice, /company, /company?tab=config, /company?tab=users,
 * /contract, /contract/CT-2024-0315?tab=members, /counsel, /counsel/CN-2024-0112?tab=members, /lawsuit, /lawsuit/LT-2024-0101,
 * /config, /config?all, /history, /admin, /report, /user, /user/transfer, /gallery
 * 고객사에 속한 화면은 ?schema=스키마명&platform=BUPTLE_BIZ 를 함께 싣는다.
 */
export default function App() {
  const params = new URLSearchParams(window.location.search)
  const [page, detail] = window.location.pathname.split('/').filter(Boolean).map(decodeURIComponent)
  if (ComponentGallery && page === 'gallery') {
    return (
      <Suspense fallback={null}>
        <ComponentGallery />
      </Suspense>
    )
  }
  // 고객사에 속한 화면은 주소에 선택한 고객사(schema)를 싣는다. 고객사 없이 쓰는 화면(/config?all 등)은 제외
  const companyScoped = ['contract', 'counsel', 'lawsuit', 'user', 'report'].includes(page ?? '') || (['config', 'history'].includes(page ?? '') && !params.has('all'))
  if (companyScoped) syncCompanyToUrl()
  if (page === 'company') {
    const tab = companyTabs.find((t) => t === params.get('tab')) ?? 'basic'
    // /company?schema=스키마명&platform=BUPTLE_BIZ. 주소에 없으면 메인에서 고른(기억한) 고객사를 쓴다
    const saved = loadSelectedCompany()
    const schema = params.get('schema') || saved?.schema
    const platform = params.has('platform') ? (params.get('platform') === 'BUPTLE_NOVA' ? 'BUPTLE_NOVA' : 'BUPTLE_BIZ') : (saved?.platform ?? 'BUPTLE_BIZ')
    return <CompanyPage initialTab={tab} selected={schema ? { platform, schema } : undefined} />
  }
  if (page === 'contract') {
    // 계약 ID가 있으면 상세, 없으면 검색
    if (detail) {
      const tab = contractTabs.find((t) => t === params.get('tab')) ?? 'basic'
      return <ContractDetailPage contractId={detail} initialTab={tab} />
    }
    return <ContractSearchPage initialQuery={params.get('q') ?? ''} />
  }
  if (page === 'counsel') {
    // 자문 ID가 있으면 상세, 없으면 검색
    if (detail) {
      const tab = counselTabs.find((t) => t === params.get('tab')) ?? 'basic'
      return <CounselDetailPage counselId={detail} initialTab={tab} />
    }
    return <CounselSearchPage initialQuery={params.get('q') ?? ''} />
  }
  if (page === 'lawsuit') {
    // 소송 ID가 있으면 상세, 없으면 검색
    if (detail) {
      const tab = lawsuitTabs.find((t) => t === params.get('tab')) ?? 'basic'
      return <LawsuitDetailPage lawsuitId={detail} initialTab={tab} />
    }
    return <LawsuitSearchPage initialQuery={params.get('q') ?? ''} />
  }
  if (page === 'config') return <ConfigManagePage global={params.has('all')} />
  if (page === 'history') return <HistoryPage />
  if (page === 'admin') return <AdminPage />
  if (page === 'report') return <ReportPage />
  if (page === 'user') return detail === 'transfer' ? <UserTransferPage /> : <UserListPage />
  if (page === 'main') {
    // TODO: 라우터 도입 시 선택한 고객사를 경로로 전달
    return (
      <MainPage
        configMismatch={params.has('notice')}
        onEnter={(schema, platform) => window.location.assign(`/company?schema=${encodeURIComponent(schema)}&platform=${platform}`)}
      />
    )
  }
  const view = params.get('view')
  const initialView = loginViews.find((v) => v === view) ?? 'login'
  return <LoginRoute initialView={initialView} />
}
