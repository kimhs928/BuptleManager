// TODO: 백엔드 연동 시 제거
import type { CaseEmail } from './contract'
import { MOCK_DOC_TITLES } from './user'

/** 자문 상태 코드 (BCounsel.status) */
export type CounselStatus =
  | 'DRAFT'
  | 'DEPT_CONFIRM'
  | 'DEPT_DENY'
  | 'EDITABLE'
  | 'REVIEW'
  | 'RE_REVIEW'
  | 'FINAL'
  | 'REVIEW_EDIT'
  | 'CIRCULATION'
  | 'CIR_COMPLETE'
  | 'CIR_REPLY_COMPLETE'
  | 'CIR_REVIEW_EDIT'
  | 'COMPLETE'
  | 'STOP'

/** 상태 코드별 화면 이름과 점 색 */
export const COUNSEL_STATUS_INFO: Record<CounselStatus, { label: string; dot: string }> = {
  DRAFT: { label: '초안', dot: 'bg-ink-5' },
  DEPT_CONFIRM: { label: '부서장 승인 대기', dot: 'bg-[#fec601]' },
  DEPT_DENY: { label: '부서장 반려', dot: 'bg-danger' },
  EDITABLE: { label: '검토자 할당 대기', dot: 'bg-[#fec601]' },
  REVIEW: { label: '검토 중', dot: 'bg-[#fec601]' },
  RE_REVIEW: { label: '재검토 중', dot: 'bg-[#fec601]' },
  FINAL: { label: '최종 승인 요청', dot: 'bg-[#fec601]' },
  REVIEW_EDIT: { label: '최종 승인 반려', dot: 'bg-danger' },
  CIRCULATION: { label: '회람 중', dot: 'bg-[#3da5d9]' },
  CIR_COMPLETE: { label: '회람 완료', dot: 'bg-[#3da5d9]' },
  CIR_REPLY_COMPLETE: { label: '회람 답변 완료', dot: 'bg-[#3da5d9]' },
  CIR_REVIEW_EDIT: { label: '회람 답변 변경 요청', dot: 'bg-danger' },
  COMPLETE: { label: '자문 완료', dot: 'bg-success' },
  STOP: { label: '자문 중단', dot: 'bg-ink-3' },
}

export const COUNSEL_STATUSES = Object.keys(COUNSEL_STATUS_INFO) as CounselStatus[]

/** 검색 결과 한 줄 */
export type CounselSummary = {
  id: string
  name: string
  status: CounselStatus
  requester: string
  lawyer: string
  members: number
  createdAt: string
  deleted: boolean
  /** 검색어가 없을 때 "최근 조회한 자문"에 노출 */
  recent: boolean
}

export const MOCK_COUNSELS: CounselSummary[] = [
  { id: 'CN-2024-0112', name: '개인정보 처리방침 개정 관련 법률 자문', status: 'COMPLETE', requester: '박지훈', lawyer: '이민수', members: 4, createdAt: '2024-01-12', deleted: false, recent: true },
  { id: 'CN-2024-0205', name: '해외 고객 데이터 이전 적법성 검토', status: 'REVIEW', requester: '한도윤', lawyer: '장변호사', members: 3, createdAt: '2024-02-05', deleted: false, recent: true },
  { id: 'CN-2024-0318', name: '임직원 겸업 금지 조항 해석', status: 'DRAFT', requester: '최지우', lawyer: '-', members: 2, createdAt: '2024-03-18', deleted: false, recent: true },
  { id: 'CN-2023-1120', name: '파트너사 계약 해지 통지 절차', status: 'COMPLETE', requester: '정하늘', lawyer: '이민수', members: 3, createdAt: '2023-11-20', deleted: false, recent: false },
  { id: 'CN-2024-0127', name: '상표권 침해 경고장 대응 (초안)', status: 'DRAFT', requester: '김민수', lawyer: '-', members: 1, createdAt: '2024-01-27', deleted: true, recent: false },
  { id: 'CN-2024-0229', name: '근로계약서 표준안 검토', status: 'COMPLETE', requester: '박지훈', lawyer: '장변호사', members: 2, createdAt: '2024-02-29', deleted: true, recent: false },
]

export type CounselDetail = {
  id: string
  /** 하이픈 없는 ID */
  idPlain: string
  name: string
  status: CounselStatus
  /** YYYY-MM-DD HH:mm */
  createdAt: string
  updatedAt: string
  deleted: boolean
  /** 삭제되지 않았으면 빈 문자열 */
  deletedAt: string
  /** 관리 자문 여부 (ismanaged) */
  managed: boolean
}

export const MOCK_COUNSEL_DETAIL: CounselDetail = {
  id: 'CN-2024-0112',
  idPlain: '20240112',
  name: '개인정보 처리방침 개정 관련 법률 자문',
  status: 'COMPLETE',
  createdAt: '2024-01-12 10:20',
  updatedAt: '2024-02-02 15:40',
  deleted: false,
  deletedAt: '',
  managed: true,
}

/** 자문 ID로 상세를 만든다. 목 데이터는 CN-2024-0112 한 건뿐이라 ID, 이름, 상태, 삭제 여부만 바꾼다 */
export function getCounselDetail(id: string): CounselDetail {
  const summary = MOCK_COUNSELS.find((c) => c.id === id)
  const name = summary?.name ?? MOCK_DOC_TITLES.counsel[id]
  if (id === MOCK_COUNSEL_DETAIL.id || !name) return MOCK_COUNSEL_DETAIL
  return {
    ...MOCK_COUNSEL_DETAIL,
    id,
    idPlain: id.replace(/\D/g, ''),
    name,
    status: summary?.status ?? MOCK_COUNSEL_DETAIL.status,
    createdAt: summary ? `${summary.createdAt} 10:20` : MOCK_COUNSEL_DETAIL.createdAt,
    deleted: summary?.deleted ?? false,
    deletedAt: summary?.deleted ? '2024-05-20 16:42' : '',
  }
}

export type CounselMember = {
  id: string
  /** 사내 유저만 가진다 */
  userId?: string
  name: string
  email: string
  company: string
  phone: string
  roles: string[]
  dept: string
  deleted: boolean
  /** YYYY-MM-DD HH:mm. 삭제되지 않았으면 deletedAt 은 빈 문자열 */
  createdAt: string
  updatedAt: string
  deletedAt: string
}

export const COUNSEL_ROLES = ['요청자', '담당 변호사', '검토자', '참조']

export const MOCK_COUNSEL_MEMBERS: CounselMember[] = [
  { id: 'u1', userId: 'A00112', name: '박지훈', email: 'jihoon.park@acetech.co.kr', company: '에이스테크놀로지(주)', phone: '010-2345-6789', roles: ['요청자'], dept: '구매팀', deleted: false, createdAt: '2024-01-12 10:20', updatedAt: '2024-01-12 10:20', deletedAt: '' },
  { id: 'u2', userId: 'A00145', name: '이민수', email: 'minsu.lee@acetech.co.kr', company: '에이스테크놀로지(주)', phone: '010-3456-7890', roles: ['담당 변호사'], dept: '법무팀', deleted: false, createdAt: '2024-01-29 11:00', updatedAt: '2024-02-02 15:40', deletedAt: '' },
  { id: 'u3', name: '장변호사', email: 'lawyer.jang@hankyul.co.kr', company: '법무법인 한결', phone: '010-5555-0182', roles: ['담당 변호사'], dept: '송무팀', deleted: false, createdAt: '2024-01-30 09:30', updatedAt: '2024-01-30 09:30', deletedAt: '' },
  { id: 'u4', userId: 'A00187', name: '한도윤', email: 'doyoon.han@acetech.co.kr', company: '에이스테크놀로지(주)', phone: '010-1122-3344', roles: ['참조'], dept: '경영지원실', deleted: true, createdAt: '2024-01-12 10:20', updatedAt: '2024-03-04 14:10', deletedAt: '2024-03-04 14:10' },
]

export type DirectoryUser = { userId: string; name: string; email: string; company: string; phone: string; dept: string }

/** 참여 유저 추가 시 이름 · 이메일 · user_id 일치 여부를 확인하는 사내 유저 목록 */
export const MOCK_DIRECTORY_USERS: DirectoryUser[] = [
  { userId: 'A00112', name: '박지훈', email: 'jihoon.park@acetech.co.kr', company: '에이스테크놀로지(주)', phone: '010-2345-6789', dept: '구매팀' },
  { userId: 'A00145', name: '이민수', email: 'minsu.lee@acetech.co.kr', company: '에이스테크놀로지(주)', phone: '010-3456-7890', dept: '법무팀' },
  { userId: 'A00203', name: '김효선', email: 'kimhs928@acetech.co.kr', company: '에이스테크놀로지(주)', phone: '010-9284-1130', dept: '법무팀' },
  { userId: 'A00256', name: '최서연', email: 'seoyeon.choi@acetech.co.kr', company: '에이스테크놀로지(주)', phone: '010-4471-2058', dept: '인사팀' },
  { userId: 'A00271', name: '정우진', email: 'woojin.jung@acetech.co.kr', company: '에이스테크놀로지(주)', phone: '010-6612-7740', dept: '재무팀' },
  { userId: 'A00318', name: '오세라', email: 'sera.oh@acetech.co.kr', company: '에이스테크놀로지(주)', phone: '010-3390-5521', dept: '법무팀' },
  { userId: 'A00187', name: '한도윤', email: 'doyoon.han@acetech.co.kr', company: '에이스테크놀로지(주)', phone: '010-1122-3344', dept: '경영지원실' },
  { userId: 'A00342', name: '윤태호', email: 'taeho.yoon@acetech.co.kr', company: '에이스테크놀로지(주)', phone: '010-8813-4467', dept: '노무팀' },
  { userId: 'A00365', name: '강민지', email: 'minji.kang@acetech.co.kr', company: '에이스테크놀로지(주)', phone: '010-2058-9936', dept: '경영지원실' },
]

export type CounselWorkflowAttr = {
  key: string
  label: string
  /** single: 하나 선택, multi: 복수 선택(0개 허용) */
  type: 'single' | 'multi'
  options: string[]
  value: string[]
}

export type CounselWorkflow = { attrs: CounselWorkflowAttr[] }

export const MOCK_COUNSEL_WORKFLOW: CounselWorkflow = {
  attrs: [
    { key: 'deptApproval', label: '부서장 승인', type: 'single', options: ['필요', '불필요'], value: ['필요'] },
    { key: 'finalApproval', label: '최종 승인', type: 'single', options: ['필요', '불필요'], value: ['불필요'] },
    { key: 'circulation', label: '회람', type: 'single', options: ['필요', '불필요'], value: ['필요'] },
  ],
}

/** 자문 프로세스 단계. opt가 있으면 해당 워크플로우 항목이 '필요'일 때만 들어간다 */
export type CounselGuideStage = { name: string; opt?: string; people: { name: string; dept: string }[] }

export const COUNSEL_GUIDE: CounselGuideStage[] = [
  { name: '초안', people: [{ name: '김효선', dept: '구매팀 · 요청자' }] },
  { name: '부서장 승인', opt: 'deptApproval', people: [{ name: '박부장', dept: '구매팀 · 부서장' }] },
  { name: '검토자 배정 대기', people: [{ name: '이법무', dept: '법무팀 · 배정 담당' }] },
  { name: '검토 중', people: [{ name: '장변호사', dept: '법무팀 · 담당 변호사' }] },
  { name: '최종 승인', opt: 'finalApproval', people: [{ name: '최법무', dept: '법무팀장 · 최종 승인자' }] },
  {
    name: '회람',
    opt: 'circulation',
    people: [
      { name: '오재무', dept: '재무팀 · 회람 대상' },
      { name: '한보안', dept: '정보보호팀 · 회람 대상' },
    ],
  },
  { name: '완료', people: [{ name: '김효선', dept: '구매팀 · 요청자 (결과 확인)' }] },
]

export type CounselHistoryRow = {
  id: string
  action: string
  /** YYYY-MM-DD HH:mm */
  at: string
  deleted: boolean
  comment: string
  from: string
  to: string
  /** 프로세스 단계가 실제로 바뀐 이력인지. 서버가 구분해서 내려준다 */
  stageMove: boolean
  user: string
}

export const MOCK_COUNSEL_HISTORY: CounselHistoryRow[] = [
  { id: 'h1', action: '초안 상신', at: '2024-05-02 09:20', deleted: false, comment: '개인정보 처리방침 개정안 법률 검토 요청', from: '초안', to: '부서장 승인', stageMove: true, user: '김효선' },
  { id: 'h2', action: '부서장 승인', at: '2024-05-02 14:10', deleted: false, comment: '승인, 법무팀 검토 요청', from: '부서장 승인', to: '검토자 배정 대기', stageMove: true, user: '박부장' },
  { id: 'h3', action: '검토자 배정', at: '2024-05-03 10:00', deleted: false, comment: '개인정보 분야 담당 장변호사 배정', from: '검토자 배정 대기', to: '검토 중', stageMove: true, user: '이법무' },
  { id: 'h4', action: '검토자 배정', at: '2024-05-03 10:02', deleted: true, comment: '배정 버튼 중복 클릭으로 생성된 이력', from: '검토자 배정 대기', to: '검토 중', stageMove: true, user: '이법무' },
  { id: 'h5', action: '검토 반려', at: '2024-05-07 16:30', deleted: false, comment: '수탁사 목록과 국외 이전 항목 보완 필요', from: '검토 중', to: '초안', stageMove: true, user: '장변호사' },
  { id: 'h6', action: '초안 재상신', at: '2024-05-09 11:15', deleted: false, comment: '수탁사 목록 및 국외 이전 항목 보완 후 재요청', from: '초안', to: '부서장 승인', stageMove: true, user: '김효선' },
  { id: 'h7', action: '부서장 승인', at: '2024-05-09 15:40', deleted: false, comment: '보완 내용 확인, 재승인', from: '부서장 승인', to: '검토자 배정 대기', stageMove: true, user: '박부장' },
  { id: 'h8', action: '검토자 배정', at: '2024-05-10 09:30', deleted: false, comment: '기존 담당 장변호사 재배정', from: '검토자 배정 대기', to: '검토 중', stageMove: true, user: '이법무' },
  { id: 'h9', action: '검토 완료', at: '2024-05-14 17:20', deleted: false, comment: '개정안 법률 의견 등록, 관련 부서 회람 요청', from: '검토 중', to: '회람', stageMove: true, user: '장변호사' },
]

/** 히스토리 액션 유저로 선택할 수 있는 이름 */
export const MOCK_COUNSEL_HISTORY_USERS = ['김효선', '박부장', '이법무', '장변호사', '최법무', '오재무', '한보안']

export type CommentType = '질문' | '답변' | '자문 전체'

export const COMMENT_TYPES: CommentType[] = ['질문', '답변', '자문 전체']

export type CounselComment = {
  id: string
  text: string
  type: CommentType
  author: string
  /** YYYY-MM-DD HH:mm */
  at: string
  updatedAt: string
  deleted: boolean
  /** 삭제되지 않았으면 빈 문자열 */
  deletedAt: string
}

export const MOCK_COUNSEL_COMMENTS: CounselComment[] = [
  { id: 'k1', text: '자문 요청드립니다. 개정된 개인정보 보호법에 맞춰 처리방침을 갱신하려고 합니다.', type: '질문', author: '박지훈', at: '2024-01-12 10:25', updatedAt: '2024-01-12 10:25', deleted: false, deletedAt: '' },
  {
    id: 'k2',
    text: "처리방침 제3조 위탁 항목을 구체적으로 기재하시길 권고드립니다. 현재 '업무 위탁'으로만 포괄 기재되어 있어 수탁자명, 위탁 업무 내용, 위탁 기간을 각각 명시해야 하며, 재위탁이 발생하는 경우 재수탁자까지 공개 범위에 포함하는 것이 안전합니다.\n\n또한 제5조 보유 기간은 전자상거래법상 계약·청약철회 기록 5년, 대금결제 기록 5년, 소비자 불만·분쟁처리 기록 3년 기준과 맞지 않으므로 항목별로 분리 기재를 권고드립니다. 국외 이전이 있는 경우 이전 국가, 이전 일시·방법, 이전받는 자의 연락처를 별도 조항으로 추가해 주시기 바랍니다.",
    type: '답변',
    author: '이민수',
    at: '2024-02-02 15:40',
    updatedAt: '2024-02-02 15:40',
    deleted: false,
    deletedAt: '',
  },
  { id: 'k3', text: '보유 기간 문구가 현행 법령과 일치하는지 확인 부탁드립니다.', type: '질문', author: '박지훈', at: '2024-01-30 11:12', updatedAt: '2024-01-30 11:20', deleted: false, deletedAt: '' },
  { id: 'k4', text: '수탁사 목록은 별도 첨부 예정. 법무법인 한결 의견 필요.', type: '자문 전체', author: '이민수', at: '2024-01-18 10:10', updatedAt: '2024-01-18 10:10', deleted: false, deletedAt: '' },
  { id: 'k5', text: '테스트 코멘트입니다. 삭제 요청.', type: '답변', author: '장변호사', at: '2024-01-20 09:00', updatedAt: '2024-01-20 09:05', deleted: true, deletedAt: '2024-01-20 09:30' },
]

/** 이 자문에서 발송된 이메일 */
export const MOCK_COUNSEL_EMAILS: CaseEmail[] = [
  {
    id: 'e1', createdAt: '2024-02-02 15:40', updatedAt: '2024-02-02 15:40', sender: '이민수', senderMail: 'minsu.lee@acetech.co.kr', receiver: '박지훈', receiverMail: 'jihoon.park@acetech.co.kr',
    subject: '[답변 완료] 개인정보 처리방침 개정 관련 법률 자문', link: 'https://ace-tech.buptle.app/mail/ML-20240202-0018',
    body: '박지훈 님,\n\n요청하신 개인정보 처리방침 개정 관련 법률 자문의 답변이 등록되었습니다.\n수탁사 목록과 국외 이전 항목을 중심으로 검토 의견을 작성했으니 확인해 주세요.\n\n이민수 드림',
  },
  {
    id: 'e2', createdAt: '2024-01-29 11:05', updatedAt: '2024-01-29 11:06', sender: '박부장', senderMail: 'boss.park@acetech.co.kr', receiver: '이민수', receiverMail: 'minsu.lee@acetech.co.kr',
    subject: '[검토 요청] 개인정보 처리방침 개정 관련 법률 자문', link: 'https://ace-tech.buptle.app/mail/ML-20240129-0011',
    body: '이민수 변호사님,\n\n부서장 승인이 완료되어 법무 검토를 요청드립니다.\n개정 시행일이 임박해 우선 검토 부탁드립니다.\n\n박부장 드림',
  },
  {
    id: 'e3', createdAt: '2024-01-12 10:25', updatedAt: '2024-01-12 10:25', sender: '박지훈', senderMail: 'jihoon.park@acetech.co.kr', receiver: '박부장', receiverMail: 'boss.park@acetech.co.kr',
    subject: '[승인 요청] 개인정보 처리방침 개정 관련 법률 자문', link: 'https://ace-tech.buptle.app/mail/ML-20240112-0007',
    body: '박부장님,\n\n개정된 개인정보 보호법에 맞춰 처리방침을 갱신하려고 합니다.\n법률 자문 요청서 승인 부탁드립니다.\n\n박지훈 드림',
  },
]
