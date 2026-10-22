// TODO: 백엔드 연동 시 제거
import type { CaseEmail } from './contract'
import { MOCK_DOC_TITLES } from './user'

/** 소송 진행 상태 코드 (BLawsuit.suit_progress) */
export type LawsuitStatus = 'PENDING' | 'REVIEW' | 'REVIEW_DONE' | 'REVIEW_D' | 'REVIEW_WRITE_ANSWER' | 'PROCESS' | 'DONE'

/** 상태 코드별 화면 이름과 점 색. 검토 · 답변서 단계는 원고 / 피고에 따라 쓰인다 */
export const LAWSUIT_STATUS_INFO: Record<LawsuitStatus, { label: string; dot: string }> = {
  PENDING: { label: '소송 초안 작성', dot: 'bg-ink-5' },
  REVIEW: { label: '검토 중', dot: 'bg-[#fec601]' },
  REVIEW_DONE: { label: '검토 완료', dot: 'bg-[#fec601]' },
  REVIEW_D: { label: '답변서 작성 중 (법무)', dot: 'bg-[#fec601]' },
  REVIEW_WRITE_ANSWER: { label: '답변서 검토 중 (기안자)', dot: 'bg-[#fec601]' },
  PROCESS: { label: '소송 진행 중', dot: 'bg-[#3da5d9]' },
  DONE: { label: '소송 완료', dot: 'bg-success' },
}

export const LAWSUIT_STATUSES = Object.keys(LAWSUIT_STATUS_INFO) as LawsuitStatus[]

/** 검색 결과 한 줄 */
export type LawsuitSummary = {
  id: string
  name: string
  status: LawsuitStatus
  amount: number
  migrated: boolean
  members: number
  createdAt: string
  deleted: boolean
  /** 검색어가 없을 때 "최근 조회한 소송"에 노출 */
  recent: boolean
}

export const MOCK_LAWSUITS: LawsuitSummary[] = [
  { id: 'LW-2024-0087', name: '임금 청구 소송 (원고 3인)', status: 'PROCESS', amount: 85000000, migrated: false, members: 4, createdAt: '2024-02-08', deleted: false, recent: true },
  { id: 'LW-2024-0142', name: '상표권 침해 금지 청구', status: 'PROCESS', amount: 120000000, migrated: false, members: 3, createdAt: '2024-03-21', deleted: false, recent: true },
  { id: 'LW-2024-0201', name: '공급계약 대금 지급 청구', status: 'PENDING', amount: 46000000, migrated: false, members: 2, createdAt: '2024-05-02', deleted: false, recent: true },
  { id: 'LW-2022-0310', name: '부당해고 구제 신청 사건', status: 'DONE', amount: 0, migrated: true, members: 3, createdAt: '2022-09-14', deleted: false, recent: false },
  { id: 'LW-2023-0455', name: '임대차 보증금 반환 청구 (초안)', status: 'PENDING', amount: 30000000, migrated: true, members: 1, createdAt: '2023-12-04', deleted: true, recent: false },
  { id: 'LW-2024-0099', name: '손해배상 청구 소송 (취하)', status: 'DONE', amount: 18000000, migrated: false, members: 2, createdAt: '2024-02-19', deleted: true, recent: false },
]

export type LawsuitDetail = {
  id: string
  /** 하이픈 없는 ID */
  idPlain: string
  name: string
  desc: string
  amount: number
  status: LawsuitStatus
  /** 원고 / 피고 (suit_type p / d) */
  suitType: '원고' | '피고'
  /** 소송 타입 (type) */
  kind: string
  /** 개시일 · 종료일 (YYYY-MM-DD, 종료 전이면 빈 문자열) */
  startDate: string
  endDate: string
  migrated: boolean
  /** YYYY-MM-DD HH:mm */
  createdAt: string
  updatedAt: string
  deleted: boolean
}

export const MOCK_LAWSUIT_DETAIL: LawsuitDetail = {
  id: 'LW-2024-0087',
  idPlain: '20240087',
  name: '임금 청구 소송 (원고 3인)',
  desc: '전 직원 3인이 제기한 미지급 연장근로수당 청구 소송. 1심 변론 준비 중이며 고객사 법무팀과 외부 대리인이 공동 대응.',
  amount: 85000000,
  status: 'PROCESS',
  suitType: '원고',
  kind: '임금 청구(민사)',
  startDate: '2024-02-08',
  endDate: '',
  migrated: false,
  createdAt: '2024-02-08 09:30',
  updatedAt: '2024-05-20 17:10',
  deleted: false,
}

/** 소송 ID로 상세를 만든다. 목 데이터는 LW-2024-0087 한 건뿐이라 ID, 이름, 상태, 금액, 삭제 여부만 바꾼다 */
export function getLawsuitDetail(id: string): LawsuitDetail {
  const summary = MOCK_LAWSUITS.find((c) => c.id === id)
  const name = summary?.name ?? MOCK_DOC_TITLES.lawsuit[id]
  if (id === MOCK_LAWSUIT_DETAIL.id || !name) return MOCK_LAWSUIT_DETAIL
  return {
    ...MOCK_LAWSUIT_DETAIL,
    id,
    idPlain: id.replace(/\D/g, ''),
    name,
    status: summary?.status ?? MOCK_LAWSUIT_DETAIL.status,
    amount: summary?.amount ?? MOCK_LAWSUIT_DETAIL.amount,
    migrated: summary?.migrated ?? false,
    createdAt: summary ? `${summary.createdAt} 09:30` : MOCK_LAWSUIT_DETAIL.createdAt,
    deleted: summary?.deleted ?? false,
  }
}

/** 대법원 연동 정보 (읽기 전용) */
export const MOCK_COURT_INFO = {
  linked: true,
  syncedAt: '2024-05-23 09:00',
  rows: [
    { label: '법원', value: '서울중앙지방법원' },
    { label: '사건번호', value: '2024가합512345' },
    { label: '사건명', value: '손해배상(기) — 클라우드 서비스 장애 관련' },
    { label: '재판부', value: '민사 제15부' },
    { label: '사건 구분', value: '민사 · 제1심' },
    { label: '원고', value: '에이스테크놀로지(주)' },
    { label: '피고', value: '(주)클라우드파트너스' },
    { label: '접수일', value: '2024-03-28' },
    { label: '다음 기일', value: '2024-06-12 14:00 · 변론기일' },
    { label: '최근 결과', value: '2024-05-17 변론기일 속행' },
    { label: '연동 일시', value: '2024-04-02 10:15' },
    { label: '연동자', value: '김효선 (CS 담당자)' },
  ],
}

export type LawsuitMember = {
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

/** 소송 참여자 유형 (BLawsuitParticipant.type) */
export const LAWSUIT_ROLES = ['소송 생성자', '담당자', '담당 변호사', '외부 변호사', '관련인']

export const MOCK_LAWSUIT_MEMBERS: LawsuitMember[] = [
  { id: 'u1', userId: 'A00112', name: '박지훈', email: 'jihoon.park@acetech.co.kr', company: '에이스테크놀로지(주)', phone: '010-2345-6789', roles: ['담당자'], dept: '인사팀', deleted: false, createdAt: '2024-02-08 09:30', updatedAt: '2024-02-08 09:30', deletedAt: '' },
  { id: 'u2', userId: 'A00145', name: '이민수', email: 'minsu.lee@acetech.co.kr', company: '에이스테크놀로지(주)', phone: '010-3456-7890', roles: ['담당 변호사'], dept: '법무팀', deleted: false, createdAt: '2024-02-08 10:05', updatedAt: '2024-05-14 11:20', deletedAt: '' },
  { id: 'u3', name: '장변호사', email: 'lawyer.jang@hankyul.co.kr', company: '법무법인 한결', phone: '010-5555-0182', roles: ['외부 변호사'], dept: '송무팀', deleted: false, createdAt: '2024-03-21 15:00', updatedAt: '2024-03-21 15:00', deletedAt: '' },
  { id: 'u4', userId: 'A00187', name: '한도윤', email: 'doyoon.han@acetech.co.kr', company: '에이스테크놀로지(주)', phone: '010-1122-3344', roles: ['관련인'], dept: '경영지원실', deleted: true, createdAt: '2024-02-08 09:30', updatedAt: '2024-04-18 17:45', deletedAt: '2024-04-18 17:45' },
]

export type DirectoryUser = { userId: string; name: string; email: string; company: string; phone: string; dept: string }

/** 참여 유저 추가 시 이름 · 이메일 · user_id 일치 여부를 확인하는 사내 유저 목록 */
export const MOCK_LAWSUIT_DIRECTORY: DirectoryUser[] = [
  { userId: 'A00112', name: '박지훈', email: 'jihoon.park@acetech.co.kr', company: '에이스테크놀로지(주)', phone: '010-2345-6789', dept: '인사팀' },
  { userId: 'A00145', name: '이민수', email: 'minsu.lee@acetech.co.kr', company: '에이스테크놀로지(주)', phone: '010-3456-7890', dept: '법무팀' },
  { userId: 'A00203', name: '김효선', email: 'kimhs928@acetech.co.kr', company: '에이스테크놀로지(주)', phone: '010-9284-1130', dept: '법무팀' },
  { userId: 'A00256', name: '최서연', email: 'seoyeon.choi@acetech.co.kr', company: '에이스테크놀로지(주)', phone: '010-4471-2058', dept: '인사팀' },
  { userId: 'A00271', name: '정우진', email: 'woojin.jung@acetech.co.kr', company: '에이스테크놀로지(주)', phone: '010-6612-7740', dept: '재무팀' },
  { userId: 'A00318', name: '오세라', email: 'sera.oh@acetech.co.kr', company: '에이스테크놀로지(주)', phone: '010-3390-5521', dept: '법무팀' },
  { userId: 'A00187', name: '한도윤', email: 'doyoon.han@acetech.co.kr', company: '에이스테크놀로지(주)', phone: '010-1122-3344', dept: '경영지원실' },
  { userId: 'A00342', name: '윤태호', email: 'taeho.yoon@acetech.co.kr', company: '에이스테크놀로지(주)', phone: '010-8813-4467', dept: '노무팀' },
  { userId: 'A00365', name: '강민지', email: 'minji.kang@acetech.co.kr', company: '에이스테크놀로지(주)', phone: '010-2058-9936', dept: '경영지원실' },
]

/** 이 소송에서 발송된 이메일 */
export const MOCK_LAWSUIT_EMAILS: CaseEmail[] = [
  {
    id: 'e1', createdAt: '2024-05-20 17:10', updatedAt: '2024-05-20 17:10', sender: '이민수', senderMail: 'minsu.lee@acetech.co.kr', receiver: '장변호사', receiverMail: 'lawyer.jang@hankyul.co.kr',
    subject: '[변론 준비] 임금 청구 소송 (원고 3인) 증거 자료 전달', link: 'https://ace-tech.buptle.app/mail/ML-20240520-0033',
    body: '장변호사님,\n\n임금 청구 소송 1심 변론 준비를 위한 근태 기록과 급여 명세서를 전달드립니다.\n다음 기일 전까지 준비서면 초안 부탁드립니다.\n\n이민수 드림',
  },
  {
    id: 'e2', createdAt: '2024-04-02 10:15', updatedAt: '2024-04-02 10:15', sender: '김효선', senderMail: 'kimhs928@acetech.co.kr', receiver: '박지훈', receiverMail: 'jihoon.park@acetech.co.kr',
    subject: '[기일 안내] 임금 청구 소송 (원고 3인) 변론기일', link: 'https://ace-tech.buptle.app/mail/ML-20240402-0009',
    body: '박지훈 님,\n\n임금 청구 소송 변론기일이 지정되어 안내드립니다.\n법원 연동 정보에서 기일을 확인하실 수 있습니다.\n\n김효선 드림',
  },
  {
    id: 'e3', createdAt: '2024-02-08 09:40', updatedAt: '2024-02-08 09:41', sender: '박지훈', senderMail: 'jihoon.park@acetech.co.kr', receiver: '이민수', receiverMail: 'minsu.lee@acetech.co.kr',
    subject: '[소송 접수] 임금 청구 소송 (원고 3인)', link: 'https://ace-tech.buptle.app/mail/ML-20240208-0004',
    body: '이민수 변호사님,\n\n전 직원 3인이 제기한 미지급 연장근로수당 청구 소송이 접수되었습니다.\n대응 방향 검토를 부탁드립니다.\n\n박지훈 드림',
  },
]

/** 소송 히스토리 (BLawsuit_history). 현재는 스마트 이메일 수신(action_type 40)만 저장된다 */
export type LawsuitHistoryRow = {
  id: string
  /** action_type. 40 = 이메일 수신(BCC) */
  actionType: number
  /** action_text */
  actionText: string
  /** create_time (YYYY-MM-DD HH:mm) */
  createdAt: string
  /** 액션 유저 (create_user). 이메일 수신은 시스템이 자동으로 쌓아서 비어 있다 */
  actionUser: string
  /** 발신자 (name) */
  name: string
  /** 메일 제목 (extra_info.subject) */
  subject: string
  /** 메일 본문 요약 (comment) */
  comment: string
  /** 첨부파일 수 (extra_info.attached_files) */
  attachedCount: number
  deleted: boolean
  /** 삭제되지 않았으면 빈 문자열 */
  deletedAt: string
}

export const MOCK_LAWSUIT_HISTORY: LawsuitHistoryRow[] = [
  { id: 'lh1', actionType: 40, actionText: '이메일 수신', actionUser: '', createdAt: '2024-05-22 16:12', name: 'jang@hankyul.co.kr', subject: 'Re: 임금 청구 소송 준비서면 초안 송부', comment: '준비서면 초안을 첨부합니다. 연장근로 산정 기준 부분을 중점적으로 확인해 주세요.', attachedCount: 2, deleted: false, deletedAt: '' },
  { id: 'lh2', actionType: 40, actionText: '이메일 수신', actionUser: '', createdAt: '2024-05-17 18:03', name: 'court-notice@scourt.go.kr', subject: '[대법원] 변론기일 속행 안내', comment: '2024-05-17 변론기일이 속행되어 다음 기일이 2024-06-12 14:00으로 지정되었습니다.', attachedCount: 0, deleted: false, deletedAt: '' },
  { id: 'lh3', actionType: 40, actionText: '이메일 수신', actionUser: '', createdAt: '2024-04-18 11:40', name: 'opponent@lawfirm-seoul.kr', subject: '상대방 대리인 답변서 제출 안내', comment: '상대방 대리인이 답변서를 제출하였습니다. 첨부 파일을 확인해 주세요.', attachedCount: 1, deleted: true, deletedAt: '2024-04-18 17:45' },
  { id: 'lh4', actionType: 40, actionText: '이메일 수신', actionUser: '', createdAt: '2024-03-28 09:21', name: 'minsu.lee@acetech.co.kr', subject: 'FW: 소송 접수증 사본', comment: '소장 접수증 사본을 전달드립니다.', attachedCount: 1, deleted: false, deletedAt: '' },
]
