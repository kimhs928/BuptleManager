import type { ServicePlatform } from './platform'
import { MOCK_COMPANY_DETAIL } from '../mocks/companyDetail'

export type SelectedCompany = { platform: ServicePlatform; schema: string; name: string }

const KEY = 'selectedCompany'

/** 메인에서 고른 고객사를 기억한다. 페이지를 옮겨 다녀도 유지되고, 탭을 닫으면 사라진다 */
export function saveSelectedCompany(company: SelectedCompany) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(company))
  } catch {
    // 저장소를 쓸 수 없으면 기억하지 못할 뿐 화면은 동작한다
  }
}

/** 기억한 고객사. 없으면 null */
export function loadSelectedCompany(): SelectedCompany | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const v = JSON.parse(raw) as Partial<SelectedCompany>
    if (typeof v.schema !== 'string' || typeof v.name !== 'string' || (v.platform !== 'BUPTLE_BIZ' && v.platform !== 'BUPTLE_NOVA')) return null
    return { platform: v.platform, schema: v.schema, name: v.name }
  } catch {
    return null
  }
}

/** 지금 작업 중인 고객사. 고르지 않았으면 임시 mock 고객사 */
export function currentCompany(): SelectedCompany {
  return loadSelectedCompany() ?? { platform: MOCK_COMPANY_DETAIL.platform, schema: MOCK_COMPANY_DETAIL.schema, name: MOCK_COMPANY_DETAIL.name }
}

/** 고객사 정보 화면 주소. 고객사를 고르지 않았으면 스키마 없는 주소 */
export function companyHref(): string {
  const c = loadSelectedCompany()
  return c ? `?company=${encodeURIComponent(c.schema)}&platform=${c.platform}` : '?company'
}
