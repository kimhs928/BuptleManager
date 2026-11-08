import { useEffect, useState } from 'react'
import type { ServicePlatform } from '../lib/platform'

export type CompanySummary = {
  schemaName: string
  name: string
  domain: string
  platform: ServicePlatform
  active: boolean
  userCount: number | null
}

type State = { key: string; companies: CompanySummary[]; error: boolean }

/** 고객사를 서버에서 검색한다. 검색어를 바꾸면 잠시 기다렸다가 요청한다. 검색어가 비어 있으면 요청하지 않는다 */
export function useCompanySearch(platform: ServicePlatform, query: string) {
  const [state, setState] = useState<State>({ key: '', companies: [], error: false })
  const q = query.trim()
  const key = `${platform}|${q}`

  useEffect(() => {
    if (!q) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      const params = new URLSearchParams({ platform, q })
      fetch(`/api/companies?${params}`, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error(String(res.status))
          return res.json() as Promise<CompanySummary[]>
        })
        .then((companies) => setState({ key, companies, error: false }))
        .catch((e: unknown) => {
          if (e instanceof DOMException && e.name === 'AbortError') return
          setState({ key, companies: [], error: true })
        })
    }, 250)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [platform, q, key])

  // 현재 검색어의 응답이 아직 오지 않았으면 로딩 중
  const ready = q !== '' && state.key === key
  return { companies: ready ? state.companies : [], loading: q !== '' && !ready, error: ready && state.error }
}
