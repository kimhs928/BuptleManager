/** 관리자 화면에서 관리하는 enum 표 (드롭다운 선택지). 서버 /api/enums 응답과 같은 모양 */
export type EnumGroup = { code: string; name: string; sortOrder: number }

export type EnumValue = {
  id: number
  /** Biz DB 에 저장된 실제 값 */
  code: string
  constName: string | null
  label: string
  remark: string | null
  groupCode: string | null
  sortOrder: number
  active: boolean
}

export type EnumSetSummary = { code: string; name: string; description: string | null; valueCount: number }

export type EnumSetDetail = { set: EnumSetSummary; groups: EnumGroup[]; values: EnumValue[] }

export type EnumValueUpdate = Pick<EnumValue, 'label' | 'remark' | 'groupCode' | 'sortOrder' | 'active'>

export type EnumValueCreate = { code: string; constName?: string; label: string; remark?: string; groupCode?: string | null }

/** 계약 상태 표 코드 */
export const CONTRACT_STATUS_SET = 'BIZ_CONTRACT_STATUS'

function xsrfHeader(): Record<string, string> {
  const m = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/)
  return m ? { 'X-XSRF-TOKEN': decodeURIComponent(m[1]) } : {}
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...xsrfHeader(), ...init?.headers },
  })
  if (!res.ok) {
    const problem = (await res.json().catch(() => null)) as { detail?: string } | null
    throw new Error(problem?.detail ?? String(res.status))
  }
  return res.json() as Promise<T>
}

const base = (set: string) => `/api/enums/${encodeURIComponent(set)}`

export const enumApi = {
  sets: (signal?: AbortSignal) => request<EnumSetSummary[]>('/api/enums', { signal }),
  detail: (set: string, signal?: AbortSignal) => request<EnumSetDetail>(base(set), { signal }),
  updateValue: (set: string, id: number, body: EnumValueUpdate) => request<EnumValue>(`${base(set)}/values/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  createValue: (set: string, body: EnumValueCreate) => request<EnumValue>(`${base(set)}/values`, { method: 'POST', body: JSON.stringify(body) }),
  renameGroup: (set: string, group: string, name: string) => request<EnumGroup>(`${base(set)}/groups/${encodeURIComponent(group)}`, { method: 'PATCH', body: JSON.stringify({ name }) }),
}
