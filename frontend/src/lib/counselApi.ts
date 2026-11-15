/** Biz 자문 조회 API (/api/biz/companies/{schema}/counsels). 서버 응답과 같은 모양 */
export type CounselSummaryApi = {
  id: string
  name: string
  status: string
  requester: string
  lawyer: string
  members: number
  createdAt: string
  deleted: boolean
  recent: boolean
}

export type CounselPage = { items: CounselSummaryApi[]; page: number; size: number; total: number }

export type CounselDetailApi = {
  id: string
  idPlain: string
  name: string
  status: string
  createdAt: string
  updatedAt: string
  deleted: boolean
  deletedAt: string | null
  managed: boolean
  counselType: string
  showRangeType: string
  projects: string[]
  migrated: boolean
  categoryParent: string
  category: string
}

export type CounselMemberApi = {
  id: string
  userId: string | null
  name: string
  email: string
  company: string
  phone: string
  roles: string[]
  dept: string
  sysRoles: string[]
  approvalType: string
  approvalStatus: string
  deleted: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type CounselProcessApi = {
  attrs: { key: string; label: string; type: 'single' | 'multi'; options: string[]; value: string[] }[]
  guide: { name: string; opt: string | null; people: { name: string; dept: string }[] }[]
}

export type CounselHistoryApi = {
  id: string
  action: string
  at: string
  deleted: boolean
  comment: string
  body: string
  from: string
  to: string
  stageMove: boolean
  user: string
}

export type CounselEmailApi = {
  id: string
  createdAt: string
  updatedAt: string
  sender: string
  senderMail: string
  receiver: string
  receiverMail: string
  subject: string
  link: string
  body: string
}

const base = (schema: string) => `/api/biz/companies/${encodeURIComponent(schema)}/counsels`

async function get<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal })
  if (!res.ok) {
    const problem = (await res.json().catch(() => null)) as { detail?: string } | null
    throw new Error(problem?.detail ?? String(res.status))
  }
  return res.json() as Promise<T>
}

export const counselApi = {
  search: (schema: string, q: string, includeDeleted: boolean, signal?: AbortSignal) =>
    get<CounselPage>(`${base(schema)}?q=${encodeURIComponent(q)}&includeDeleted=${includeDeleted}&size=50`, signal),
  detail: (schema: string, id: string, signal?: AbortSignal) => get<CounselDetailApi>(`${base(schema)}/${encodeURIComponent(id)}`, signal),
  members: (schema: string, id: string, signal?: AbortSignal) => get<{ items: CounselMemberApi[] }>(`${base(schema)}/${encodeURIComponent(id)}/members`, signal),
  process: (schema: string, id: string, signal?: AbortSignal) => get<CounselProcessApi>(`${base(schema)}/${encodeURIComponent(id)}/process`, signal),
  history: (schema: string, id: string, signal?: AbortSignal) => get<{ items: CounselHistoryApi[] }>(`${base(schema)}/${encodeURIComponent(id)}/history`, signal),
  emails: (schema: string, id: string, signal?: AbortSignal) => get<{ items: CounselEmailApi[] }>(`${base(schema)}/${encodeURIComponent(id)}/emails`, signal),
}
