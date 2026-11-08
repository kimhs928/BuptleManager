import { useEffect, useState } from 'react'
import type { ServicePlatform } from '../lib/platform'
import type { CompanyDetail } from '../mocks/companyDetail'

/** 서버 응답. 값이 없을 수 있는 항목은 null */
type CompanyDetailResponse = Omit<CompanyDetail, 'createdAt' | 'users' | 'userLimit'> & {
  createdAt: string | null
  users: number | null
  userLimit: number | null
}

type State = { key: string; company: CompanyDetail | null; error: boolean }

const platformPath: Record<ServicePlatform, string> = { BUPTLE_BIZ: 'biz', BUPTLE_NOVA: 'nova' }

/** 선택한 고객사의 기본 정보를 서버에서 가져온다 */
export function useCompanyDetail(platform: ServicePlatform, schema: string) {
  const [state, setState] = useState<State>({ key: '', company: null, error: false })
  const key = `${platform}|${schema}`

  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/${platformPath[platform]}/companies/${encodeURIComponent(schema)}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status))
        return res.json() as Promise<CompanyDetailResponse>
      })
      .then((r) => setState({ key, company: { ...r, createdAt: r.createdAt ?? '', users: r.users ?? 0, userLimit: r.userLimit ?? 0 }, error: false }))
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setState({ key, company: null, error: true })
      })
    return () => controller.abort()
  }, [platform, schema, key])

  const ready = state.key === key
  return { company: ready ? state.company : null, loading: !ready, error: ready && state.error }
}
