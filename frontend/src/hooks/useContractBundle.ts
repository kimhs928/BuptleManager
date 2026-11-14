import { useEffect, useState } from 'react'
import { contractApi } from '../lib/contractApi'
import type { ContractDetailApi, EmailApi, HistoryListApi, MemberApi, WorkflowApi } from '../lib/contractApi'

export type ContractBundle = { detail: ContractDetailApi; members: MemberApi[]; history: HistoryListApi; emails: EmailApi[]; workflow: WorkflowApi }

type State = { key: string; data: ContractBundle | null; error: string | null }

/** 계약 상세 화면에 필요한 기본 정보 · 참여 유저 · 히스토리 · 이메일을 한꺼번에 가져온다 */
export function useContractBundle(schema: string, id: string) {
  const [state, setState] = useState<State>({ key: '', data: null, error: null })
  const key = `${schema}|${id}`

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    Promise.all([contractApi.detail(schema, id, signal), contractApi.members(schema, id, signal), contractApi.history(schema, id, signal), contractApi.emails(schema, id, signal), contractApi.workflow(schema, id, signal)])
      .then(([detail, members, history, emails, workflow]) => setState({ key, data: { detail, members: members.items, history, emails: emails.items, workflow }, error: null }))
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setState({ key, data: null, error: e instanceof Error ? e.message : '' })
      })
    return () => controller.abort()
  }, [key, schema, id])

  const ready = state.key === key
  return { data: ready ? state.data : null, loading: !ready, error: ready ? state.error : null }
}
