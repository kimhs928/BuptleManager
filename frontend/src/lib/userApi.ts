/** Biz 유저 조회 API (/api/biz/companies/{schema}/users). 서버 응답과 같은 모양 */
export type UserApi = {
  id: string
  pk: string
  name: string
  email: string
  lastLogin: string | null
  roles: string[]
  active: boolean
  joinedAt: string | null
  createdAt: string | null
  updatedAt: string | null
  phone: string
  dept: string
  title: string
  desc: string
  empNo: string
  migrated: boolean
  docCounts: { contract: number; counsel: number; lawsuit: number }
}

export type UserDocumentApi = { id: string; title: string }

import { sendJson } from './apiWrite'
import type { Audit } from './apiWrite'

const base = (schema: string) => `/api/biz/companies/${encodeURIComponent(schema)}/users`

async function get<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal })
  if (!res.ok) {
    const problem = (await res.json().catch(() => null)) as { detail?: string } | null
    throw new Error(problem?.detail ?? String(res.status))
  }
  return res.json() as Promise<T>
}

export const userApi = {
  list: (schema: string, signal?: AbortSignal) => get<{ items: UserApi[] }>(base(schema), signal),
  documents: (schema: string, pk: string, kind: string, signal?: AbortSignal) =>
    get<{ items: UserDocumentApi[] }>(`${base(schema)}/${encodeURIComponent(pk)}/documents?kind=${encodeURIComponent(kind)}`, signal),
  update: (schema: string, pk: string, body: UserUpdateBody) =>
    sendJson<{ item: UserApi; changeCount: number; historyIds: number[] }>('PATCH', `${base(schema)}/${encodeURIComponent(pk)}`, body),
}

export type UserUpdateBody = {
  name?: string
  email?: string
  active?: boolean
  roles?: string[]
  phone?: string
  dept?: string
  title?: string
  desc?: string
  empNo?: string
  joinedAt?: string
  createdAt?: string
  updatedAt?: string
  audit: Audit
}
