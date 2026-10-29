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

/** 임시 진입점: /, /?view=network, /?view=denied, /?main, /?main&notice, /?company, /?company&tab=config, /?company&tab=users, /?contract, /?contract=CT-2024-0315&tab=members, /?counsel, /?counsel=CN-2024-0112&tab=members, /?lawsuit, /?lawsuit=LT-2024-0101, /?config, /?config&all, /?history, /?admin, /?report, /?user, /?user=transfer, /?gallery */
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
    return <CompanyPage initialTab={tab} />
  }
  if (params.has('contract')) {
    // 계약 ID가 있으면 상세, 없으면 검색
    const contractId = params.get('contract')
    if (contractId) {
      const tab = contractTabs.find((t) => t === params.get('tab')) ?? 'basic'
      return <ContractDetailPage contractId={contractId} initialTab={tab} />
    }
    return <ContractSearchPage initialQuery={params.get('q') ?? ''} />
  }
  if (params.has('counsel')) {
    // 자문 ID가 있으면 상세, 없으면 검색
    const counselId = params.get('counsel')
    if (counselId) {
      const tab = counselTabs.find((t) => t === params.get('tab')) ?? 'basic'
      return <CounselDetailPage counselId={counselId} initialTab={tab} />
    }
    return <CounselSearchPage initialQuery={params.get('q') ?? ''} />
  }
  if (params.has('lawsuit')) {
    // 소송 ID가 있으면 상세, 없으면 검색
    const lawsuitId = params.get('lawsuit')
    if (lawsuitId) {
      const tab = lawsuitTabs.find((t) => t === params.get('tab')) ?? 'basic'
      return <LawsuitDetailPage lawsuitId={lawsuitId} initialTab={tab} />
    }
    return <LawsuitSearchPage initialQuery={params.get('q') ?? ''} />
  }
  if (params.has('config')) return <ConfigManagePage global={params.has('all')} />
  if (params.has('history')) return <HistoryPage />
  if (params.has('admin')) return <AdminPage />
  if (params.has('report')) return <ReportPage />
  if (params.has('user')) {
    return params.get('user') === 'transfer' ? <UserTransferPage /> : <UserListPage />
  }
  if (params.has('main')) {
    // TODO: 라우터 도입 시 선택한 고객사(schema)를 경로로 전달
    return <MainPage configMismatch={params.has('notice')} onEnter={() => window.location.assign('?company')} />
  }
  const view = params.get('view')
  const initialView = loginViews.find((v) => v === view) ?? 'login'
  return <LoginRoute initialView={initialView} />
}
