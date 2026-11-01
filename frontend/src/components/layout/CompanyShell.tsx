import type { ReactNode } from 'react'
import type { CompanyDetail } from '../../mocks/companyDetail'
import { MOCK_COMPANY_DETAIL } from '../../mocks/companyDetail'
import { CompanyTopBar } from './CompanyTopBar'
import { Sidebar } from './Sidebar'

/** 메인(고객사 선택) 화면 주소 */
export const MAIN_HREF = '?main'

type Props = {
  active: 'company' | 'config' | 'contract' | 'counsel' | 'lawsuit' | 'user' | 'errorReport' | 'history' | 'admin'
  trail: { label: string; href?: string }[]
  /** 고객사를 고르지 않고 들어온 화면. 고객사에 속한 메뉴를 감춘다 */
  noCompany?: boolean
  /** 선택한 고객사. 없으면 임시 mock 고객사를 쓴다 */
  company?: Pick<CompanyDetail, 'platform' | 'name' | 'schema'>
  children: ReactNode
}

/** 고객사 선택 후 화면의 공통 틀 (사이드바 + 상단 바 + 본문) */
export function CompanyShell({ active, trail, noCompany, company = MOCK_COMPANY_DETAIL, children }: Props) {
  return (
    <div className="flex min-h-screen w-full bg-bg">
      <Sidebar mainHref={MAIN_HREF} active={active} noCompany={noCompany} />
      <div className="flex min-w-0 flex-1 flex-col">
        <CompanyTopBar platform={company.platform} companyName={company.name} schema={company.schema} noCompany={noCompany} mainHref={MAIN_HREF} trail={trail} />
        <main className="flex flex-1 flex-col gap-6 px-9 pb-10 pt-7">{children}</main>
      </div>
    </div>
  )
}
