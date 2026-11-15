import type { CounselDetailApi, CounselEmailApi, CounselHistoryApi, CounselMemberApi, CounselProcessApi, CounselSummaryApi } from '../../lib/counselApi'
import type { CaseEmail } from '../../mocks/contract'
import type { CounselApprovalStatus, CounselApprovalType, CounselDetail, CounselGuideStage, CounselHistoryRow, CounselMember, CounselStatus, CounselSummary, CounselType, CounselWorkflow, ShowRangeType } from '../../mocks/counsel'
import { toLocalText } from '../contract/contractAdapter'

/** 서버 응답을 화면이 쓰는 자문 모양으로 바꾼다 */
export function toSummary(a: CounselSummaryApi): CounselSummary {
  return { ...a, status: a.status as CounselStatus }
}

export function toCounselDetail(a: CounselDetailApi): CounselDetail {
  return {
    ...a,
    status: a.status as CounselStatus,
    createdAt: toLocalText(a.createdAt),
    updatedAt: toLocalText(a.updatedAt),
    deletedAt: a.deletedAt ? toLocalText(a.deletedAt) : '',
    counselType: a.counselType as CounselType,
    showRangeType: a.showRangeType as ShowRangeType,
  }
}

export function toMember(a: CounselMemberApi): CounselMember {
  return {
    ...a,
    userId: a.userId ?? undefined,
    approvalType: a.approvalType as CounselApprovalType | '',
    approvalStatus: a.approvalStatus as CounselApprovalStatus | '',
    createdAt: toLocalText(a.createdAt),
    updatedAt: toLocalText(a.updatedAt),
    deletedAt: a.deletedAt ? toLocalText(a.deletedAt) : '',
  }
}

export function toHistoryRow(a: CounselHistoryApi): CounselHistoryRow {
  return { ...a, at: toLocalText(a.at) }
}

export function toEmail(a: CounselEmailApi): CaseEmail {
  return { ...a, createdAt: toLocalText(a.createdAt), updatedAt: toLocalText(a.updatedAt) }
}

export type ProcessView = { workflow: CounselWorkflow; guide: CounselGuideStage[] }

export function toProcess(a: CounselProcessApi): ProcessView {
  return {
    workflow: { attrs: a.attrs },
    guide: a.guide.map((g) => ({ name: g.name, opt: g.opt ?? undefined, people: g.people })),
  }
}
