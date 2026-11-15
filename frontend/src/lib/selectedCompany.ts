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
  return c ? `/company?schema=${encodeURIComponent(c.schema)}&platform=${c.platform}` : '/company'
}

/**
 * 고객사에 속한 화면의 주소에 선택한 고객사를 싣는다 (/contract → /contract?schema=acetech&platform=BUPTLE_BIZ).
 * 주소에 이미 스키마가 있으면 그것을 따른다. 기억한 고객사와 다르면 기억을 그 고객사로 바꾼다.
 */
export function syncCompanyToUrl() {
  const { search, hash, pathname } = window.location
  const params = new URLSearchParams(search)
  const saved = loadSelectedCompany()
  const schema = params.get('schema')

  if (schema) {
    if (saved?.schema === schema) return
    const platform: ServicePlatform = params.get('platform') === 'BUPTLE_NOVA' ? 'BUPTLE_NOVA' : 'BUPTLE_BIZ'
    saveSelectedCompany({ platform, schema, name: schema })
    // 이름을 모르므로 서버에서 받아 채운 뒤 다시 그린다. 실패하면 스키마명을 이름 대신 쓴다
    fetch(`/api/${platform === 'BUPTLE_NOVA' ? 'nova' : 'biz'}/companies/${encodeURIComponent(schema)}`)
      .then((res) => (res.ok ? (res.json() as Promise<{ name: string }>) : null))
      .then((c) => {
        if (!c) return
        saveSelectedCompany({ platform, schema, name: c.name })
        window.location.reload()
      })
      .catch(() => undefined)
    return
  }
  if (!saved) return

  const sep = search ? '&' : '?'
  const next = `${pathname}${search}${sep}schema=${encodeURIComponent(saved.schema)}&platform=${saved.platform}${hash}`
  window.history.replaceState(null, '', next)
}

/** 주소를 새로고침 없이 바꾼다. 지금 주소의 고객사(schema, platform)는 그대로 유지한다 */
export function replaceUrl(path: string, extra: Record<string, string> = {}) {
  const current = new URLSearchParams(window.location.search)
  const next = new URLSearchParams()
  for (const key of ['schema', 'platform']) {
    const v = current.get(key)
    if (v) next.set(key, v)
  }
  for (const [k, v] of Object.entries(extra)) next.set(k, v)
  const qs = next.toString()
  window.history.replaceState(null, '', qs ? `${path}?${qs}` : path)
}
