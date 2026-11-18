import { useEffect, useState } from 'react'
import { formatDateTimeSec } from '../lib/date'
import { userApi } from '../lib/userApi'
import type { UserApi, UserDocumentApi } from '../lib/userApi'
import type { CompanyUser } from '../mocks/user'

/** ISO(UTC) → 'YYYY-MM-DD HH:mm:ss' (브라우저 시간대). 값이 없으면 빈 문자열 */
const toText = (iso: string | null) => (iso ? formatDateTimeSec(new Date(iso)) : '')

export function toCompanyUser(a: UserApi): CompanyUser {
  return {
    ...a,
    lastLogin: toText(a.lastLogin),
    joinedAt: toText(a.joinedAt),
    createdAt: toText(a.createdAt),
    updatedAt: toText(a.updatedAt),
  }
}

type State = { schema: string; users: CompanyUser[]; error: string | null }

/** 고객사의 유저를 Biz DB 에서 가져온다 */
export function useCompanyUsers(schema: string) {
  const [state, setState] = useState<State>({ schema: '', users: [], error: null })

  useEffect(() => {
    const controller = new AbortController()
    userApi
      .list(schema, controller.signal)
      .then((r) => setState({ schema, users: r.items.map(toCompanyUser), error: null }))
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setState({ schema, users: [], error: e instanceof Error ? e.message : '' })
      })
    return () => controller.abort()
  }, [schema])

  const ready = state.schema === schema
  return { users: ready ? state.users : [], loading: !ready, error: ready ? state.error : null }
}

type DocsState = { key: string; items: UserDocumentApi[]; error: boolean }

/** 유저가 참여 중인 문서(계약/자문/소송 중 한 종류). kind 가 비어 있으면 요청하지 않는다 */
export function useUserDocuments(schema: string, pk: string, kind: string) {
  const [state, setState] = useState<DocsState>({ key: '', items: [], error: false })
  const key = kind ? `${schema}|${pk}|${kind}` : ''

  useEffect(() => {
    if (!key) return
    const controller = new AbortController()
    userApi
      .documents(schema, pk, kind, controller.signal)
      .then((r) => setState({ key, items: r.items, error: false }))
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setState({ key, items: [], error: true })
      })
    return () => controller.abort()
  }, [key, schema, pk, kind])

  if (!key) return { items: [], loading: false, error: false }
  const ready = state.key === key
  return { items: ready ? state.items : [], loading: !ready, error: ready && state.error }
}
