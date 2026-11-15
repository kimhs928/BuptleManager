import { useEffect, useState } from 'react'
import { counselApi } from '../lib/counselApi'
import type { CounselPage } from '../lib/counselApi'

type State = { key: string; data: CounselPage | null; error: string | null }

/** 고객사의 자문을 Biz DB 에서 검색한다. q 가 비어 있으면 요청하지 않는다 */
export function useCounselSearch(schema: string, q: string, includeDeleted: boolean) {
  const [state, setState] = useState<State>({ key: '', data: null, error: null })
  const key = q ? `${schema}|${q}|${includeDeleted}` : ''

  useEffect(() => {
    if (!key) return
    const controller = new AbortController()
    // 입력이 멈춘 뒤에 요청한다
    const timer = setTimeout(() => {
      counselApi
        .search(schema, q, includeDeleted, controller.signal)
        .then((data) => setState({ key, data, error: null }))
        .catch((e: unknown) => {
          if (e instanceof DOMException && e.name === 'AbortError') return
          setState({ key, data: null, error: e instanceof Error ? e.message : '' })
        })
    }, 300)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [key, schema, q, includeDeleted])

  if (!key) return { items: [], total: 0, loading: false, error: null as string | null }
  const ready = state.key === key
  return { items: ready ? (state.data?.items ?? []) : [], total: ready ? (state.data?.total ?? 0) : 0, loading: !ready, error: ready ? state.error : null }
}
