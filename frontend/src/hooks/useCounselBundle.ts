import { useEffect, useState } from 'react'
import { counselApi } from '../lib/counselApi'
import type { CounselDetailApi, CounselEmailApi, CounselHistoryApi, CounselMemberApi, CounselProcessApi } from '../lib/counselApi'

export type CounselBundle = { detail: CounselDetailApi; members: CounselMemberApi[]; process: CounselProcessApi; history: CounselHistoryApi[]; emails: CounselEmailApi[] }

type State = { key: string; data: CounselBundle | null; error: string | null }

/** 자문 상세 화면에 필요한 기본 정보 · 참여 유저 · 프로세스 · 히스토리 · 이메일을 한꺼번에 가져온다 */
export function useCounselBundle(schema: string, id: string) {
  const [state, setState] = useState<State>({ key: '', data: null, error: null })
  const key = `${schema}|${id}`

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    Promise.all([
      counselApi.detail(schema, id, signal),
      counselApi.members(schema, id, signal),
      counselApi.process(schema, id, signal),
      counselApi.history(schema, id, signal),
      counselApi.emails(schema, id, signal),
    ])
      .then(([detail, members, process, history, emails]) => setState({ key, data: { detail, members: members.items, process, history: history.items, emails: emails.items }, error: null }))
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setState({ key, data: null, error: e instanceof Error ? e.message : '' })
      })
    return () => controller.abort()
  }, [key, schema, id])

  const ready = state.key === key
  return { data: ready ? state.data : null, loading: !ready, error: ready ? state.error : null }
}
