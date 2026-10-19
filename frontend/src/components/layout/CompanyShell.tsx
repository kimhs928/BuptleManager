import type { ReactNode } from 'react'
import { MOCK_COMPANY_DETAIL } from '../../mocks/companyDetail'
import { CompanyTopBar } from './CompanyTopBar'
import { Sidebar } from './Sidebar'

/** 메인(고객사 선택) 화면 주소 */
export const MAIN_HREF = '?main'

type Props = {
  active: 'company' | 'contract'
  trail: { label: string; href?: string }[]
  children: ReactNode
}

/** 고객사 선택 후 화면의 공통 틀 (사이드바 + 상단 바 + 본문) */
export function CompanyShell({ active, trail, children }: Props) {
  const company = MOCK_COMPANY_DETAIL
  return (
    <div className="flex min-h-screen w-full bg-bg">
      <Sidebar mainHref={MAIN_HREF} active={active} />
      <div className="flex min-w-0 flex-1 flex-col">
        <CompanyTopBar platform={company.platform} companyName={company.name} schema={company.schema} mainHref={MAIN_HREF} trail={trail} />
        <main className="flex flex-1 flex-col gap-6 px-9 pb-10 pt-7">{children}</main>
      </div>
    </div>
  )
}
