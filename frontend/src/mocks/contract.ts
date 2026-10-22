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

/** 워크플로우에 설정된 내부 유저 (역할별 담당자) */
export type WorkflowUser = {
  /** 워크플로우에서 맡은 역할 */
  role: string
  name: string
  email: string
  dept: string
  /** 이 유저가 처리하는 프로세스 단계 */
  stage: string
  /** 있으면 이 워크플로우 항목이 '불필요'일 때 사용하지 않는 유저로 보여 준다 */
  opt?: string
}

export const MOCK_WORKFLOW_USERS: WorkflowUser[] = [
  { role: '부서장', name: '박부장', email: 'boss.park@acetech.co.kr', dept: '구매팀', stage: '부서장 승인', opt: 'deptApproval' },
  { role: '법무 검토자', name: '장변호사', email: 'lawyer.jang@acetech.co.kr', dept: '법무팀', stage: '검토' },
  { role: '법무 최종 승인자', name: '이법무', email: 'legal.lee@acetech.co.kr', dept: '법무팀', stage: '최종 승인', opt: 'legalFinal' },
  { role: '날인 담당자', name: '김날인', email: 'seal.kim@acetech.co.kr', dept: '구매팀', stage: '서명' },
]

/** 단계 순서. 도착 단계가 출발 단계보다 앞이면 역방향(되돌림) */
export const STAGE_ORDER: Record<string, number> = { 초안: 0, '부서장 승인': 1, 검토: 2, '최종 승인': 3, '당사 서명': 4, '상대 서명': 5, 완료: 6 }

/**
 * 히스토리 한 건의 표시 유형 (contract_history.extra_info 의 html_type).
 * action_type에 따라 자동으로 정해지며, 타임라인 항목을 어떤 모양으로 그릴지 정한다.
 */
export type HtmlType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export const HTML_TYPES: HtmlType[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

/** html_type별 의미와 화면 모양 */
export const HTML_TYPE_INFO: Record<HtmlType, { label: string; short: string; actions: string; screen: string }> = {
  1: { short: '일반', label: '일반 텍스트', actions: '생성, 수정, 전송, 서명, 반려, 상태 변경, 중지/재개 등', screen: '코멘트 텍스트' },
  2: { short: '코멘트', label: '코멘트', actions: '코멘트, 문서 멘션', screen: '입력창, 작성자, 본인이면 수정/삭제 버튼' },
  3: { short: '승인', label: '승인 계열 (문서 비교 포함)', actions: '부서장 승인 요청, 최종 승인, 승인 결재, 서명부서 요청/승인 등', screen: '문서 이력 보기 + 다운로드 버튼' },
  4: { short: '이메일', label: '스마트 이메일', actions: '발송/수신', screen: '이메일 본문 말줄임 + 첨부 목록' },
  5: { short: '승인 결과', label: '승인 결과', actions: '부서장 승인 확인/반려, 검토 반려', screen: '승인 결과 형태' },
  6: { short: '검토', label: '검토 계열 (문서 비교 포함)', actions: '검토 요청/완료/의견, 기안자 전달, 문서 변경, 재검토', screen: '문서 이력 보기 + 다운로드 버튼' },
  7: { short: '참여자', label: '참여자 변경', actions: '참여자/관련인/서명인 추가 및 삭제, 권한 변경', screen: '참여자 목록 형태' },
  8: { short: '첨부', label: '첨부파일', actions: '첨부 추가/삭제, 외부 발송/취소', screen: '첨부파일 형태' },
  9: { short: '전환', label: '담당자 전환 등', actions: '변호사/기안자/부서 전환, 외부 편집, 자동 서명, 프로세스 편집', screen: '전환 정보 형태' },
}

/** 서명 구분 (sign_cls) */
export type SignCls = 0 | 1 | 2 | 3 | 4

export const SIGN_CLS: Record<SignCls, { constant: string; label: string }> = {
  0: { constant: 'SIG_CLS_PRI', label: '개인 서명' },
  1: { constant: 'SIG_CLS_COM', label: '기업 서명' },
  2: { constant: 'SIG_CLS_HAND', label: '수기 서명' },
  3: { constant: 'SIG_CLS_GROUP_SIGN_SKIP', label: '그룹 사인 완료' },
  4: { constant: 'SIG_CLS_AFFIXING_DEPT', label: '서명부서 담당자 서명 (인감 관리)' },
}

/** 서명 방법 */
export type SignMethodCode = 0 | 1 | 2 | 3 | 4 | 22

export const SIGN_METHOD_CODE: Record<SignMethodCode, string> = {
  0: 'SMS 인증',
  1: '공동인증서',
  2: '디지털 직인',
  3: '개인 서명',
  4: '수기',
  22: '전자 인감',
}

/** compare_doc이 true여도 문서 이력 버튼을 숨기는 action_text */
export const COMPARE_HIDDEN_ACTIONS = ['검토 의견', '계약 반려', '계약 중지', '계약 재검토 진행', '(Migration)']

/** 히스토리에 함께 저장되는 부가 정보 (extra_info) */
export type HistoryExtra = {
  htmlType: HtmlType
  /** true면 특정 문서 버전(docId)과 연결된 이력이다 */
  compareDoc: boolean
  /** 연결된 문서 버전 ID */
  docId?: string
  /** 다국어 메시지 틀에 끼워 넣는 값 */
  textVariable?: Record<string, string>
  signCls?: SignCls
  signMethod?: SignMethodCode
  /** html_type 2: 코멘트 작성자 */
  commenter?: string
  /** html_type 4: 스마트 이메일 */
  email?: { subject: string; body: string; attachments: string[] }
  /** html_type 5: 승인 결과 */
  result?: '승인' | '반려'
  /** html_type 7: 참여자 변경 목록 */
  participants?: { name: string; role: string; change: '추가' | '삭제' | '권한 변경' }[]
  /** html_type 8: 첨부파일 변경 목록 */
  attachments?: { name: string; change: '추가' | '삭제' | '외부 발송' | '발송 취소' }[]
  /** html_type 9: 담당자 전환 정보 */
  transfer?: { kind: string; from: string; to: string }
}

export type HistoryRow = {
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
  extra: HistoryExtra
}

export const MOCK_HISTORY: HistoryRow[] = [
  { id: 'h1', action: '템플릿 변경', at: '2024-03-11 09:10', deleted: true, comment: '템플릿 업데이트로 초안 재작성', from: '초안', to: '초안', stageMove: false, user: '김효선', extra: { htmlType: 6, compareDoc: true, docId: 'DOC-0315-V1', textVariable: { templateName: '클라우드 서비스 이용계약서 v2', newTemplateName: '클라우드 서비스 이용계약서 v3' } } },
  { id: 'h2', action: '초안 상신', at: '2024-03-11 09:30', deleted: false, comment: '초안 작성 후 부서장 승인 요청', from: '초안', to: '부서장 승인', stageMove: true, user: '김효선', extra: { htmlType: 3, compareDoc: true, docId: 'DOC-0315-V2', textVariable: { approver: '박부장', docVersion: 'v2' } } },
  { id: 'h3', action: '부서장 반려', at: '2024-03-11 15:10', deleted: false, comment: '계약 기간과 금액 재확인 필요', from: '부서장 승인', to: '초안', stageMove: true, user: '박부장', extra: { htmlType: 5, compareDoc: false, result: '반려', textVariable: { approver: '박부장', reason: '계약 기간과 금액 재확인 필요' } } },
  { id: 'h4', action: '초안 재상신', at: '2024-03-12 10:05', deleted: false, comment: '계약 기간 수정 후 재요청', from: '초안', to: '부서장 승인', stageMove: true, user: '김효선', extra: { htmlType: 3, compareDoc: true, docId: 'DOC-0315-V3', textVariable: { approver: '박부장', docVersion: 'v3' } } },
  { id: 'h5', action: '부서장 승인', at: '2024-03-12 13:20', deleted: false, comment: '승인, 법무 검토 요청', from: '부서장 승인', to: '검토', stageMove: true, user: '박부장', extra: { htmlType: 5, compareDoc: false, result: '승인', textVariable: { approver: '박부장', nextStage: '검토' } } },
  { id: 'h6', action: '검토 완료', at: '2024-03-13 17:40', deleted: false, comment: '자동 갱신 조항 수정 의견 반영', from: '검토', to: '최종 승인', stageMove: true, user: '장변호사', extra: { htmlType: 6, compareDoc: true, docId: 'DOC-0315-V4', textVariable: { reviewer: '장변호사', docVersion: 'v4' } } },
  { id: 'h9', action: '최종 승인', at: '2024-03-15 09:10', deleted: false, comment: '최종 승인, 서명 단계 진행', from: '최종 승인', to: '당사 서명', stageMove: true, user: '이법무', extra: { htmlType: 3, compareDoc: true, docId: 'DOC-0315-V5', textVariable: { approver: '이법무', docVersion: 'v5' } } },
  { id: 'h10', action: '당사 서명 완료', at: '2024-03-15 11:00', deleted: false, comment: '당사 날인 완료, 상대방 서명 요청', from: '당사 서명', to: '상대 서명', stageMove: true, user: '김날인', extra: { htmlType: 1, compareDoc: false, signCls: 1, signMethod: 2, textVariable: { signer: '김날인', company: '에이스테크놀로지(주)' } } },
  { id: 'h11', action: '서명 취소', at: '2024-03-15 14:25', deleted: false, comment: '상대방 요청으로 계약 금액 정정 필요', from: '상대 서명', to: '최종 승인', stageMove: true, user: '김날인', extra: { htmlType: 1, compareDoc: false, signCls: 1, signMethod: 2, textVariable: { signer: '김날인', reason: '계약 금액 정정' } } },
  { id: 'h12', action: '최종 승인', at: '2024-03-15 16:40', deleted: false, comment: '금액 정정 확인 후 재승인', from: '최종 승인', to: '당사 서명', stageMove: true, user: '이법무', extra: { htmlType: 3, compareDoc: true, docId: 'DOC-0315-V6', textVariable: { approver: '이법무', docVersion: 'v6' } } },
  { id: 'h13', action: '당사 서명 완료', at: '2024-03-15 16:45', deleted: false, comment: '재날인 완료, 상대방 서명 요청 발송', from: '당사 서명', to: '상대 서명', stageMove: true, user: '김날인', extra: { htmlType: 1, compareDoc: false, signCls: 1, signMethod: 22, textVariable: { signer: '김날인', company: '에이스테크놀로지(주)' } } },
  {
    id: 'h14', action: '코멘트', at: '2024-03-12 11:30', deleted: false, comment: '계약 기간 수정 사항을 확인해 주세요.', from: '부서장 승인', to: '부서장 승인', stageMove: false, user: '김효선',
    extra: { htmlType: 2, compareDoc: false, commenter: '김효선', textVariable: { mention: '박부장' } },
  },
  {
    id: 'h15', action: '이메일 발송', at: '2024-03-13 10:20', deleted: false, comment: '법무 검토 요청 메일 발송', from: '검토', to: '검토', stageMove: false, user: '김효선',
    extra: {
      htmlType: 4,
      compareDoc: false,
      textVariable: { receiver: '장변호사' },
      email: {
        subject: '[검토 요청] 2024 클라우드 서비스 이용계약 (갱신)',
        body: '안녕하세요, 장변호사님.\n2024 클라우드 서비스 이용계약 (갱신) 건의 법무 검토를 요청드립니다. 특히 자동 갱신 조항과 손해배상 범위를 중점적으로 봐 주세요.',
        attachments: ['클라우드_이용계약_v4.docx', '견적서_2024.pdf'],
      },
    },
  },
  {
    id: 'h16', action: '참여자 추가', at: '2024-03-14 09:00', deleted: false, comment: '상대방 서명자와 참조인 추가', from: '최종 승인', to: '최종 승인', stageMove: false, user: '김효선',
    extra: {
      htmlType: 7,
      compareDoc: false,
      participants: [
        { name: '박성준', role: '상대방 서명자', change: '추가' },
        { name: '최유리', role: '참조', change: '추가' },
        { name: '이서연', role: '검토자', change: '권한 변경' },
      ],
    },
  },
  {
    id: 'h17', action: '첨부 추가', at: '2024-03-14 13:40', deleted: false, comment: '견적서와 사업자등록증 첨부', from: '최종 승인', to: '최종 승인', stageMove: false, user: '김효선',
    extra: {
      htmlType: 8,
      compareDoc: false,
      attachments: [
        { name: '견적서_2024.pdf', change: '추가' },
        { name: '사업자등록증_사본.pdf', change: '추가' },
        { name: '구_견적서.pdf', change: '삭제' },
      ],
    },
  },
  {
    id: 'h18', action: '담당 변호사 전환', at: '2024-03-13 15:00', deleted: false, comment: '개인정보 분야 전문 변호사로 교체', from: '검토', to: '검토', stageMove: false, user: '이법무',
    extra: { htmlType: 9, compareDoc: false, transfer: { kind: '담당 변호사', from: '박변호사', to: '장변호사' }, textVariable: { from: '박변호사', to: '장변호사' } },
  },
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
