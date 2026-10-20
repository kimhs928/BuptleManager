// TODO: 백엔드 연동 시 제거
import { MOCK_DOC_TITLES } from './user'

export type ContractStatus = '작성중' | '검토중' | '서명 진행중' | '체결 완료' | '반려'

/** 검색 결과 한 줄 */
export type ContractSummary = {
  id: string
  name: string
  status: ContractStatus
  kind: string
  drafter: string
  members: number
  createdAt: string
  deleted: boolean
  deletedAt?: string
  deletedBy?: string
  /** 검색어가 없을 때 "최근 조회한 계약"에 노출 */
  recent: boolean
}

export const MOCK_CONTRACTS: ContractSummary[] = [
  { id: 'CT-2024-0315', name: '2024 클라우드 서비스 이용계약 (갱신)', status: '서명 진행중', kind: '전자 · 전자서명', drafter: '홍길동', members: 4, createdAt: '2024-03-15', deleted: false, recent: true },
  { id: 'CT-2024-0402', name: '데이터 처리 위탁계약', status: '체결 완료', kind: '전자 · 전자서명', drafter: '홍길동', members: 3, createdAt: '2024-04-02', deleted: false, recent: true },
  { id: 'CT-2024-0518', name: '비밀유지계약 (NDA) · 파트너사', status: '검토중', kind: '전자 · 전자서명 · 보안', drafter: '김길동', members: 2, createdAt: '2024-05-18', deleted: false, recent: true },
  { id: 'CT-2024-0120', name: '2023 클라우드 서비스 이용계약', status: '체결 완료', kind: '문서 · 종이서명', drafter: '홍길동', members: 4, createdAt: '2023-03-10', deleted: false, recent: false },
  { id: 'CT-2024-0207', name: '유지보수 용역계약 (초안)', status: '작성중', kind: '전자 · 전자서명', drafter: '박철수', members: 1, createdAt: '2024-02-07', deleted: true, deletedAt: '2024-05-20 16:42', deletedBy: '박철수', recent: true },
  { id: 'CT-2024-0330', name: '라이선스 추가 구매 계약', status: '반려', kind: '전자 · 전자서명', drafter: '박철수', members: 2, createdAt: '2024-03-30', deleted: true, deletedAt: '2024-04-02 10:15', deletedBy: '박철수', recent: false },
]

/** 계약 기본 정보 (날짜는 datetime-local 형식 YYYY-MM-DDTHH:mm) */
export type ContractDetail = {
  id: string
  idPlain: string
  name: string
  summary: string
  startDate: string
  endDate: string
  amount: number
  lang: 'ko' | 'en' | 'ja'
  status: ContractStatus
  deleted: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string
  migration: boolean
  kind: string
  signType: string
  grade: string
  autoRenew: boolean
}

export const MOCK_CONTRACT_DETAIL: ContractDetail = {
  id: 'CT-2024-0315',
  idPlain: '20240315',
  name: '2024 클라우드 서비스 이용계약 (갱신)',
  summary: '에이스테크놀로지 전사 SaaS 구독 갱신 계약. 라이선스 200석, 연 단위 자동 갱신 조항 포함.',
  startDate: '2024-03-15',
  endDate: '2025-03-14',
  amount: 48000000,
  lang: 'ko',
  status: '서명 진행중',
  deleted: false,
  createdAt: '2024-03-15T10:42',
  updatedAt: '2024-05-21T16:08',
  deletedAt: '',
  migration: false,
  kind: '전자계약',
  signType: '전자서명',
  grade: '일반(비보안)',
  autoRenew: true,
}

export const MOCK_CONTRACT_TEMPLATE = {
  name: '클라우드 서비스 이용계약서 v3',
  categoryParent: '서비스 이용',
  category: 'SaaS 구독',
  description: 'SaaS 구독형 서비스 표준 이용계약. 갱신 계약에 사용.',
  draftUpload: true,
  draftUploadLabel: '사용자 문서 초안 업로드 템플릿',
  draftFile: 'cloud_service_v3.docx',
}

/** 계약 문서. 첫 항목이 최종 문서, 나머지는 첨부파일 */
export const MOCK_CONTRACT_DOCS = [
  { id: 'd1', name: '2024 클라우드 서비스 이용계약 (갱신).pdf', kind: '최종 문서' },
  { id: 'd2', name: '견적서_2024.pdf', kind: '첨부파일' },
  { id: 'd3', name: '사업자등록증_사본.pdf', kind: '첨부파일' },
]

export type MemberKind = 'internal' | 'external'

export type ContractMember = {
  id: string
  kind: MemberKind
  roles: string[]
  name: string
  email: string
  company: string
  dept: string
  phone: string
  /** 내부 유저의 계약 내 권한. 외부 유저는 비어 있다 */
  perm: string[]
  signMethod: string
  signType: string
  signStatus: string
  lang: 'ko' | 'en' | 'ja'
  sysRoles: string[]
  deleted: boolean
  joinedAt: string
  updatedAt: string
  deletedAt: string
}

export const MOCK_MEMBERS: ContractMember[] = [
  { id: 'm1', kind: 'internal', roles: ['기안자', '부서장'], name: '김민수', email: 'minsu.kim@acetech.co.kr', company: '에이스테크놀로지(주)', dept: '법무팀', phone: '010-2345-6789', perm: ['관리'], signMethod: '개인 서명', signType: 'SMS 인증', signStatus: '완료', lang: 'ko', sysRoles: ['관리자', '법무검토자'], deleted: false, joinedAt: '2024-03-15T10:42', updatedAt: '2024-05-21T16:08', deletedAt: '' },
  { id: 'm2', kind: 'internal', roles: ['검토자'], name: '이서연', email: 'seoyeon.lee@acetech.co.kr', company: '에이스테크놀로지(주)', dept: '법무팀', phone: '010-3456-7890', perm: ['조회'], signMethod: '-', signType: '-', signStatus: '-', lang: 'ko', sysRoles: ['법무검토자'], deleted: false, joinedAt: '2024-03-15T10:45', updatedAt: '2024-05-20T11:30', deletedAt: '' },
  { id: 'm3', kind: 'external', roles: ['상대방 서명자', '담당자'], name: '박성준', email: 'sj.park@cloudpartners.co.kr', company: '(주)클라우드파트너스', dept: '영업본부', phone: '010-9876-5432', perm: [], signMethod: '회사 서명', signType: '디지털 직인', signStatus: '대기', lang: 'ko', sysRoles: [], deleted: false, joinedAt: '2024-04-02T09:15', updatedAt: '2024-05-21T16:08', deletedAt: '' },
  { id: 'm4', kind: 'external', roles: ['참조'], name: '최유리', email: 'yr.choi@cloudpartners.co.kr', company: '(주)클라우드파트너스', dept: '법무팀', phone: '010-1122-3344', perm: [], signMethod: '-', signType: '-', signStatus: '-', lang: 'en', sysRoles: [], deleted: true, joinedAt: '2024-04-02T09:20', updatedAt: '2024-04-30T14:05', deletedAt: '2024-04-30T14:05' },
]

/** 내부 유저 추가 시 일치 여부를 확인하는 사내 유저 목록 */
export const MOCK_DIRECTORY = [
  { name: '박준호', email: 'junho.park@acetech.co.kr', userId: 'A00388' },
  { name: '최지우', email: 'jiwoo.choi@acetech.co.kr', userId: 'A00402' },
]

export type WorkflowAttr = {
  key: string
  label: string
  /** single: 하나 선택, multi: 복수 선택(0개 허용) */
  type: 'single' | 'multi'
  options: string[]
  value: string[]
}

export type Workflow = { name: string; rev: string; attrs: WorkflowAttr[] }

export const MOCK_WORKFLOW: Workflow = {
  name: '표준 전자 계약 워크플로우',
  rev: 'WF-ACE-0315-232',
  attrs: [
    { key: 'docType', label: '계약 형태', type: 'single', options: ['전자계약', '문서계약'], value: ['전자계약'] },
    { key: 'templateEdit', label: '템플릿 수정', type: 'multi', options: ['임직원 템플릿 내용 수정', '협력 업체 템플릿 내용 수정'], value: ['임직원 템플릿 내용 수정'] },
    { key: 'receive', label: '수신 계약', type: 'single', options: ['Y', 'N'], value: ['N'] },
    { key: 'attachRequired', label: '계약 첨부파일 필수', type: 'single', options: ['필요', '불필요'], value: ['필요'] },
    { key: 'labels', label: '기본 라벨', type: 'multi', options: ['구매', 'IT 서비스', '연간 계약', '보안 검토'], value: ['구매', '연간 계약'] },
    { key: 'deptApproval', label: '부서장 승인', type: 'single', options: ['필요', '불필요'], value: ['필요'] },
    { key: 'requiredRelated', label: '필수 계약 관련인', type: 'single', options: ['필요', '불필요'], value: ['불필요'] },
    { key: 'legalDraft', label: '법무팀 신규 계약 작성', type: 'single', options: ['필요', '불필요'], value: ['불필요'] },
    { key: 'legalFinal', label: '법무팀 최종 승인', type: 'single', options: ['필요', '검토자가 최종승인', '불필요'], value: ['필요'] },
  ],
}

/** 계약 프로세스 단계와 담당자 */
export type GuideStage = { name: string; substages?: string[]; people: { name: string; dept: string }[] }

export const MOCK_GUIDE: GuideStage[] = [
  { name: '초안', people: [{ name: '김효선', dept: '구매팀 · 기안자' }] },
  { name: '부서장 승인', people: [{ name: '박부장', dept: '구매팀 · 부서장' }] },
  { name: '검토', people: [{ name: '장변호사', dept: '법무팀 · 검토자' }] },
  { name: '최종 승인', people: [{ name: '이법무', dept: '법무팀 · 최종 승인자' }] },
  { name: '서명', substages: ['당사 서명', '상대 서명'], people: [{ name: '당사 · 김날인', dept: '구매팀 · 날인 담당자' }, { name: '상대 · 한도윤', dept: '(주)클라우드파트너스' }] },
  { name: '완료', people: [{ name: '김회수', dept: '구매팀 · 원본 회수 담당자' }] },
]

/** 단계 순서. 도착 단계가 출발 단계보다 앞이면 역방향(되돌림) */
export const STAGE_ORDER: Record<string, number> = { 초안: 0, '부서장 승인': 1, 검토: 2, '최종 승인': 3, '당사 서명': 4, '상대 서명': 5, 완료: 6 }

export type HistoryRow = {
  id: string
  action: string
  /** YYYY-MM-DD HH:mm */
  at: string
  deleted: boolean
  comment: string
  from: string
  to: string
  user: string
}

export const MOCK_HISTORY: HistoryRow[] = [
  { id: 'h1', action: '템플릿 변경', at: '2024-03-11 09:10', deleted: true, comment: '템플릿 업데이트로 초안 재작성', from: '초안', to: '초안', user: '김효선' },
  { id: 'h2', action: '초안 상신', at: '2024-03-11 09:30', deleted: false, comment: '초안 작성 후 부서장 승인 요청', from: '초안', to: '부서장 승인', user: '김효선' },
  { id: 'h3', action: '부서장 반려', at: '2024-03-11 15:10', deleted: false, comment: '계약 기간과 금액 재확인 필요', from: '부서장 승인', to: '초안', user: '박부장' },
  { id: 'h4', action: '초안 재상신', at: '2024-03-12 10:05', deleted: false, comment: '계약 기간 수정 후 재요청', from: '초안', to: '부서장 승인', user: '김효선' },
  { id: 'h5', action: '부서장 승인', at: '2024-03-12 13:20', deleted: false, comment: '승인, 법무 검토 요청', from: '부서장 승인', to: '검토', user: '박부장' },
  { id: 'h6', action: '검토 완료', at: '2024-03-13 17:40', deleted: false, comment: '자동 갱신 조항 수정 의견 반영', from: '검토', to: '최종 승인', user: '장변호사' },
  { id: 'h7', action: '재검토 요청', at: '2024-03-14 10:15', deleted: false, comment: '손해배상 범위 재검토 필요', from: '최종 승인', to: '검토', user: '이법무' },
  { id: 'h8', action: '재검토 완료', at: '2024-03-14 16:30', deleted: false, comment: '손해배상 상한 조항 추가', from: '검토', to: '최종 승인', user: '장변호사' },
  { id: 'h9', action: '최종 승인', at: '2024-03-15 09:10', deleted: false, comment: '최종 승인, 서명 단계 진행', from: '최종 승인', to: '당사 서명', user: '이법무' },
  { id: 'h10', action: '당사 서명 완료', at: '2024-03-15 11:00', deleted: false, comment: '당사 날인 완료, 상대방 서명 요청', from: '당사 서명', to: '상대 서명', user: '김날인' },
  { id: 'h11', action: '서명 취소', at: '2024-03-15 14:25', deleted: false, comment: '상대방 요청으로 계약 금액 정정 필요', from: '상대 서명', to: '최종 승인', user: '김날인' },
  { id: 'h12', action: '최종 승인', at: '2024-03-15 16:40', deleted: false, comment: '금액 정정 확인 후 재승인', from: '최종 승인', to: '당사 서명', user: '이법무' },
  { id: 'h13', action: '당사 서명 완료', at: '2024-03-15 16:45', deleted: false, comment: '재날인 완료, 상대방 서명 요청 발송', from: '당사 서명', to: '상대 서명', user: '김날인' },
]

/** 히스토리 액션 유저로 선택할 수 있는 계약 참여 유저 */
export const MOCK_HISTORY_USERS = ['김효선', '박부장', '장변호사', '이법무', '김날인', '한도윤', '김회수']

export type ContractEmail = {
  id: string
  createdAt: string
  updatedAt: string
  sender: string
  senderMail: string
  receiver: string
  receiverMail: string
  subject: string
  link: string
  contractId: string
  body: string
}

export const MOCK_EMAILS: ContractEmail[] = [
  {
    id: 'e1', createdAt: '2024-03-15 16:45', updatedAt: '2024-03-15 16:45', sender: '박지훈', senderMail: 'jihoon.park@acetech.co.kr', receiver: '한도윤', receiverMail: 'doyoon.han@acetech.co.kr',
    subject: '[서명 요청] 2024 클라우드 서비스 이용계약 (갱신)', link: 'https://ace-tech.buptle.app/mail/ML-20240315-0042', contractId: 'CT-2024-0315',
    body: '안녕하세요, 한도윤 대표님.\n\n2024 클라우드 서비스 이용계약 (갱신) 건에 대한 전자서명을 요청드립니다.\n아래 링크에서 계약 내용을 확인하신 뒤 서명해 주세요.\n\n- 계약명: 2024 클라우드 서비스 이용계약 (갱신)\n- 계약 기간: 2024-03-15 ~ 2025-03-14\n- 서명 기한: 2024-03-22\n\n감사합니다.\n박지훈 드림',
  },
  {
    id: 'e2', createdAt: '2024-03-15 16:40', updatedAt: '2024-03-15 16:41', sender: '이민수', senderMail: 'minsu.lee@acetech.co.kr', receiver: '박지훈', receiverMail: 'jihoon.park@acetech.co.kr',
    subject: '[승인 요청] 2024 클라우드 서비스 이용계약 (갱신)', link: 'https://ace-tech.buptle.app/mail/ML-20240315-0041', contractId: 'CT-2024-0315',
    body: '박지훈 부서장님,\n\n법무 검토를 마친 계약서의 승인을 요청드립니다.\n제7조 자동 갱신 조항은 법무팀 검토 의견을 반영해 수정했습니다.\n\n확인 후 승인 부탁드립니다.\n\n이민수 드림',
  },
  {
    id: 'e3', createdAt: '2024-03-15 14:20', updatedAt: '2024-03-15 14:20', sender: '김효선', senderMail: 'hyoseon.kim@acetech.co.kr', receiver: '이민수', receiverMail: 'minsu.lee@acetech.co.kr',
    subject: '[검토 요청] 2024 클라우드 서비스 이용계약 (갱신) 초안', link: 'https://ace-tech.buptle.app/mail/ML-20240315-0038', contractId: 'CT-2024-0315',
    body: '이민수 변호사님,\n\n계약 초안이 작성되어 법무 검토를 요청드립니다.\n특히 자동 갱신 조항과 손해배상 범위를 중점적으로 봐 주세요.\n\n김효선 드림',
  },
  {
    id: 'e4', createdAt: '2024-03-14 17:20', updatedAt: '2024-03-15 09:35', sender: '김효선', senderMail: 'hyoseon.kim@acetech.co.kr', receiver: '장변호사', receiverMail: 'lawyer.jang@acetech.co.kr',
    subject: '[알림] 계약 템플릿이 변경되었습니다', link: 'https://ace-tech.buptle.app/mail/ML-20240314-0030', contractId: 'CT-2024-0315',
    body: '장변호사님,\n\n계약 템플릿이 최신 버전(v3)으로 변경되어 초안이 재작성되었습니다.\n이전 초안은 삭제 처리되었으니 새 초안을 기준으로 검토해 주세요.\n\n김효선 드림',
  },
]

/** 계약 ID로 상세를 만든다. 목 데이터는 CT-2024-0315 한 건뿐이라 ID, 이름, 상태, 삭제 여부만 바꾼다 */
export function getContractDetail(id: string): ContractDetail {
  const summary = MOCK_CONTRACTS.find((c) => c.id === id)
  const name = summary?.name ?? MOCK_DOC_TITLES.contract[id]
  if (id === MOCK_CONTRACT_DETAIL.id || !name) return MOCK_CONTRACT_DETAIL
  return {
    ...MOCK_CONTRACT_DETAIL,
    id,
    idPlain: id.replace(/\D/g, ''),
    name,
    status: summary?.status ?? MOCK_CONTRACT_DETAIL.status,
    deleted: summary?.deleted ?? false,
    deletedAt: summary?.deletedAt ? summary.deletedAt.replace(' ', 'T') : '',
  }
}
