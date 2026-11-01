import { useEffect, useState } from 'react'

export type OperationType = 'SEARCH' | 'VIEW' | 'UPDATE' | 'ADD' | 'DELETE' | 'TRANSFER' | 'EXPORT' | 'FORCE_LOGOUT'

export type RecentContract = {
  contractId: string
  /** 작업 당시 기록된 계약명. 기록이 없으면 빈 문자열 */
  name: string
  lastOperation: OperationType
  /** ISO 8601 (UTC) */
  operatedAt: string
  operator: string
}

type State = { schema: string; items: RecentContract[]; error: boolean }

/** 고객사에서 최근 작업한 계약을 BuptleManager 작업 이력에서 가져온다 */
export function useRecentContracts(schema: string | null) {
  const [state, setState] = useState<State>({ schema: '', items: [], error: false })

  useEffect(() => {
    if (!schema) return
    const controller = new AbortController()
    fetch(`/api/biz/companies/${encodeURIComponent(schema)}/contracts/recent`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status))
        return res.json() as Promise<{ items: RecentContract[] }>
      })
      .then((r) => setState({ schema, items: r.items, error: false }))
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setState({ schema, items: [], error: true })
      })
    return () => controller.abort()
  }, [schema])

  if (!schema) return { items: [], loading: false, error: false }
  const ready = state.schema === schema
  return { items: ready ? state.items : [], loading: !ready, error: ready && state.error }
}
