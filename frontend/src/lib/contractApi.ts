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

export type ContractInfoApi = {
  id: string
  idPlain: string
  name: string
  summary: string
  startDate: string | null
  endDate: string | null
  amount: number
  lang: 'ko' | 'en' | 'ja'
  status: ContractStatusInfo
  deleted: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  migration: boolean
  kind: 'ELECTRONIC' | 'DOCUMENT'
  signType: string
  grade: 'NORMAL' | 'SECURE'
  autoRenew: boolean
  documents: { id: string; name: string; kind: 'FINAL' | 'ATTACHMENT' }[]
}

export type ContractTemplateApi = {
  name: string
  categoryParent: string
  category: string
  description: string
  draftUpload: boolean
  draftUploadLabel: string | null
  draftFile: string | null
}

export type ContractDetailApi = { contract: ContractInfoApi; template: ContractTemplateApi | null }

export type MemberApi = {
  id: string
  kind: 'internal' | 'external'
  roles: string[]
  name: string
  email: string
  company: string
  dept: string
  phone: string
  perm: string[]
  signMethod: string
  signType: string
  signStatus: string
  lang: 'ko' | 'en' | 'ja'
  sysRoles: string[]
  deleted: boolean
  joinedAt: string
  updatedAt: string
  deletedAt: string | null
}

export type HistoryExtraApi = {
  htmlType: number
  compareDoc: boolean
  docId: string | null
  signCls: number | null
  signMethod: number | null
  commenter: string | null
  email: { subject: string; body: string; attachments: string[] } | null
  result: '승인' | '반려' | null
  participants: { name: string; role: string; change: '추가' | '삭제' | '권한 변경' }[] | null
  attachments: { name: string; change: '추가' | '삭제' | '외부 발송' | '발송 취소' }[] | null
  transfer: { kind: string; from: string; to: string } | null
}

export type HistoryApi = {
  id: string
  action: string
  actionType: number
  at: string
  user: string
  deleted: boolean
  comment: string
  from: string
  to: string
  stageMove: boolean
  extra: HistoryExtraApi
}

export type HistoryListApi = { items: HistoryApi[]; users: string[]; actions: string[] }

export type EmailApi = {
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
  contractId: string
}

export type WorkflowApi = {
  name: string
  rev: string
  attrs: { key: string; label: string; type: 'single' | 'multi'; options: string[]; value: string[] }[]
  users: { role: string; name: string; email: string; dept: string; stage: string; optionKey: string | null }[]
  process: { name: string; substages: string[]; people: { name: string; dept: string }[] }[]
  currentStage: string
}

import { sendJson } from './apiWrite'
import type { Audit } from './apiWrite'

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
  workflow: (schema: string, id: string, signal?: AbortSignal) => get<WorkflowApi>(`${base(schema)}/${encodeURIComponent(id)}/workflow`, signal),
  members: (schema: string, id: string, signal?: AbortSignal) => get<{ items: MemberApi[] }>(`${base(schema)}/${encodeURIComponent(id)}/members`, signal),
  history: (schema: string, id: string, signal?: AbortSignal) => get<HistoryListApi>(`${base(schema)}/${encodeURIComponent(id)}/history`, signal),
  emails: (schema: string, id: string, signal?: AbortSignal) => get<{ items: EmailApi[] }>(`${base(schema)}/${encodeURIComponent(id)}/emails`, signal),
  detail: (schema: string, id: string, signal?: AbortSignal) => get<ContractDetailApi>(`${base(schema)}/${encodeURIComponent(id)}`, signal),
  search: (schema: string, q: string, includeDeleted: boolean, signal?: AbortSignal) =>
    get<ContractPage>(`${base(schema)}?q=${encodeURIComponent(q)}&includeDeleted=${includeDeleted}&size=50`, signal),
  // 수정·추가 (Biz DB 에 쓴다)
  update: (schema: string, id: string, body: ContractUpdateBody) =>
    sendJson<{ item: ContractInfoApi; changeCount: number; historyIds: number[] }>('PATCH', `${base(schema)}/${encodeURIComponent(id)}`, body),
  updateMember: (schema: string, id: string, memberId: string, body: MemberUpdateBody) =>
    sendJson<{ item: MemberApi; changeCount: number; historyIds: number[] }>('PATCH', `${base(schema)}/${encodeURIComponent(id)}/members/${encodeURIComponent(memberId)}`, body),
  addMember: (schema: string, id: string, body: MemberCreateBody) =>
    sendJson<{ item: MemberApi; historyIds: number[] }>('POST', `${base(schema)}/${encodeURIComponent(id)}/members`, body),
  updateHistory: (schema: string, id: string, historyId: string, body: HistoryUpdateBody) =>
    sendJson<{ item: HistoryApi; changeCount: number; historyIds: number[] }>('PATCH', `${base(schema)}/${encodeURIComponent(id)}/history/${encodeURIComponent(historyId)}`, body),
  updateWorkflow: (schema: string, id: string, body: { attrs: { key: string; value: string[] }[]; audit: Audit }) =>
    sendJson<{ workflow: WorkflowApi; changeCount: number; historyIds: number[] }>('PATCH', `${base(schema)}/${encodeURIComponent(id)}/workflow`, body),
}

export type ContractUpdateBody = {
  name?: string
  summary?: string
  amount?: number
  lang?: string
  statusCode?: number
  deleted?: boolean
  startDate?: string
  endDate?: string
  createdAt?: string
  updatedAt?: string
  deletedAt?: string
  autoRenew?: boolean
  audit: Audit
}

export type MemberUpdateBody = {
  name?: string
  email?: string
  company?: string
  dept?: string
  phone?: string
  roles?: string[]
  perm?: string[]
  lang?: string
  signMethod?: string
  signType?: string
  signStatus?: string
  joinedAt?: string
  updatedAt?: string
  deleted?: boolean
  deletedAt?: string
  audit: Audit
}

export type MemberCreateBody = {
  kind: 'internal' | 'external'
  name: string
  email: string
  company?: string
  dept?: string
  phone?: string
  roles?: string[]
  perm?: string[]
  lang: string
  signMethod: string
  signType: string
  audit: Audit
}

export type HistoryUpdateBody = { user?: string; at?: string; deleted?: boolean; comment?: string; audit: Audit }
