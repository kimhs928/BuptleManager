/** Biz 계약 조회 API (/api/biz/companies/{schema}/contracts). 서버 응답과 같은 모양 */
export type ContractStatusInfo = { code: number; label: string; groupCode: string | null; groupName: string | null }

export type ContractSummaryApi = {
  id: string
  name: string
  status: ContractStatusInfo
  kind: string
  creatorName: string
  members: number
  /** YYYY-MM-DD */
  createdAt: string
  deleted: boolean
  deletedAt: string | null
  deletedBy: string | null
}

export type ContractPage = { items: ContractSummaryApi[]; page: number; size: number; total: number }

const base = (schema: string) => `/api/biz/companies/${encodeURIComponent(schema)}/contracts`

async function get<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal })
  if (!res.ok) {
    const problem = (await res.json().catch(() => null)) as { detail?: string } | null
    throw new Error(problem?.detail ?? String(res.status))
  }
  return res.json() as Promise<T>
}

export const contractApi = {
  search: (schema: string, q: string, includeDeleted: boolean, signal?: AbortSignal) =>
    get<ContractPage>(`${base(schema)}?q=${encodeURIComponent(q)}&includeDeleted=${includeDeleted}&size=50`, signal),
}
