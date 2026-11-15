import type { ContractDetail, ContractEmail, ContractMember, GuideStage, HistoryRow, HtmlType, SignCls, SignMethodCode, Workflow, WorkflowUser } from '../../mocks/contract'
import type { ContractDetailApi, EmailApi, HistoryApi, MemberApi, WorkflowApi } from '../../lib/contractApi'

const pad = (n: number) => String(n).padStart(2, '0')

/** ISO(UTC) → 화면 입력용 'YYYY-MM-DDTHH:mm' (브라우저 시간대) */
function toLocalInput(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 서버 응답을 화면이 쓰는 계약 기본 정보 모양으로 바꾼다 */
export function toContractDetail(api: ContractDetailApi): ContractDetail {
  const c = api.contract
  return {
    id: c.id,
    idPlain: c.idPlain,
    name: c.name,
    summary: c.summary,
    startDate: c.startDate ?? '',
    endDate: c.endDate ?? '',
    amount: c.amount,
    lang: c.lang,
    status: c.status.label,
    statusCode: String(c.status.code),
    statusGroup: c.status.groupCode,
    deleted: c.deleted,
    createdAt: toLocalInput(c.createdAt),
    updatedAt: toLocalInput(c.updatedAt),
    deletedAt: toLocalInput(c.deletedAt),
    migration: c.migration,
    kind: c.kind === 'DOCUMENT' ? '문서계약' : '전자계약',
    signType: c.signType || '-',
    grade: c.grade === 'SECURE' ? '보안' : '일반(비보안)',
    autoRenew: c.autoRenew,
  }
}

export type ContractDoc = { id: string; name: string; kind: string }

export function toDocs(api: ContractDetailApi): ContractDoc[] {
  return api.contract.documents.map((d) => ({ id: d.id, name: d.name, kind: d.kind === 'FINAL' ? '최종 문서' : '첨부파일' }))
}

export type ContractTemplate = {
  name: string
  categoryParent: string
  category: string
  description: string
  draftUpload: boolean
  draftUploadLabel: string
  draftFile: string
}

/** 템플릿 없이 만든 계약이면 null */
export function toTemplate(api: ContractDetailApi): ContractTemplate | null {
  const t = api.template
  if (!t) return null
  return { ...t, draftUploadLabel: t.draftUploadLabel ?? '', draftFile: t.draftFile ?? '' }
}

/** ISO(UTC) → 'YYYY-MM-DD HH:mm' (브라우저 시간대) */
export function toLocalText(iso: string): string {
  return toLocalInput(iso).replace('T', ' ')
}

export function toMember(m: MemberApi): ContractMember {
  return { ...m, joinedAt: toLocalInput(m.joinedAt), updatedAt: toLocalInput(m.updatedAt), deletedAt: toLocalInput(m.deletedAt) }
}

export function toHistoryRow(h: HistoryApi): HistoryRow {
  const e = h.extra
  return {
    id: h.id,
    action: h.action,
    at: toLocalText(h.at),
    deleted: h.deleted,
    comment: h.comment,
    from: h.from,
    to: h.to,
    stageMove: h.stageMove,
    user: h.user,
    extra: {
      htmlType: e.htmlType as HtmlType,
      compareDoc: e.compareDoc,
      docId: e.docId ?? undefined,
      signCls: (e.signCls ?? undefined) as SignCls | undefined,
      signMethod: (e.signMethod ?? undefined) as SignMethodCode | undefined,
      commenter: e.commenter ?? undefined,
      email: e.email ?? undefined,
      result: e.result ?? undefined,
      participants: e.participants ?? undefined,
      attachments: e.attachments ?? undefined,
      transfer: e.transfer ?? undefined,
    },
  }
}

export function toEmail(m: EmailApi): ContractEmail {
  return { ...m, createdAt: toLocalText(m.createdAt), updatedAt: toLocalText(m.updatedAt) }
}

type AttrSlot = { key: string; /** 값이 없어도 빈 칸으로 자리를 보여 줄 때 쓰는 이름 */ blankLabel?: string }

/**
 * 워크플로우 설정 항목을 보여 주는 순서 (일반 설정 → 초안 → 법무팀 검토 → 최종승인 → 서명).
 * 여기 없는 항목은 마지막에 원래 순서대로 나온다.
 */
const ATTR_SLOTS: AttrSlot[] = [
  // 일반 설정
  { key: 'contents_type' }, { key: 'sign_type' }, { key: 'grade', blankLabel: '보안등급 설정' }, { key: 'is_multiple_receivers' }, { key: 'receive_contract' },
  // 초안
  { key: 'dept_confirm' }, { key: 'dept_edit_allow', blankLabel: '부서장 수정 권한' }, { key: 'template_edit' }, { key: 'con_attach' },
  // 법무팀 검토
  { key: 'legal_term' }, { key: 'legal_review' },
  // 최종승인
  { key: 'user_confirm_9' },
  // 서명
  { key: 'chkIncludeSealProc' }, { key: 'chksealcollecmail' }, { key: 'chkOrigRecovProc' }, { key: 'chkIncludeSealProcCreator' }, { key: 'chkOrigRecovProcCreator' },
]

/** 설정 항목을 정해진 순서로 늘어놓는다. blankLabel 이 있는 항목은 값이 없어도 빈 값으로 자리를 보여 준다 */
export function orderedAttrs(attrs: Workflow['attrs']): Workflow['attrs'] {
  const byKey = new Map(attrs.map((a) => [a.key, a]))
  const used = new Set(ATTR_SLOTS.map((s) => s.key))
  const ordered = ATTR_SLOTS.flatMap(({ key, blankLabel }) => {
    const found = byKey.get(key)
    if (found) return [found]
    return blankLabel ? [{ key, label: blankLabel, type: 'single' as const, options: [], value: [''] }] : []
  })
  return [...ordered, ...attrs.filter((a) => !used.has(a.key))]
}

export type WorkflowView = { workflow: Workflow; guide: GuideStage[]; users: WorkflowUser[] }

export function toWorkflow(w: WorkflowApi): WorkflowView {
  return {
    workflow: { name: w.name, rev: w.rev, attrs: w.attrs },
    guide: w.process.map((p) => ({ name: p.name, substages: p.substages, people: p.people })),
    users: w.users.map((u) => ({ role: u.role, name: u.name, email: u.email, dept: u.dept, stage: u.stage, opt: u.optionKey ?? undefined })),
  }
}
