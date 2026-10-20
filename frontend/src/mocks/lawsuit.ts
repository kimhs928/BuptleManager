// TODO: 백엔드 연동 시 제거
import { MOCK_DOC_TITLES } from './user'

export type LawsuitStatus = '접수' | '진행중' | '판결 대기' | '종결'

export const LAWSUIT_STATUSES: LawsuitStatus[] = ['접수', '진행중', '판결 대기', '종결']

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
  { id: 'LW-2024-0087', name: '임금 청구 소송 (원고 3인)', status: '진행중', amount: 85000000, migrated: false, members: 4, createdAt: '2024-02-08', deleted: false, recent: true },
  { id: 'LW-2024-0142', name: '상표권 침해 금지 청구', status: '판결 대기', amount: 120000000, migrated: false, members: 3, createdAt: '2024-03-21', deleted: false, recent: true },
  { id: 'LW-2024-0201', name: '공급계약 대금 지급 청구', status: '접수', amount: 46000000, migrated: false, members: 2, createdAt: '2024-05-02', deleted: false, recent: true },
  { id: 'LW-2022-0310', name: '부당해고 구제 신청 사건', status: '종결', amount: 0, migrated: true, members: 3, createdAt: '2022-09-14', deleted: false, recent: false },
  { id: 'LW-2023-0455', name: '임대차 보증금 반환 청구 (초안)', status: '접수', amount: 30000000, migrated: true, members: 1, createdAt: '2023-12-04', deleted: true, recent: false },
  { id: 'LW-2024-0099', name: '손해배상 청구 소송 (취하)', status: '종결', amount: 18000000, migrated: false, members: 2, createdAt: '2024-02-19', deleted: true, recent: false },
]

export type LawsuitDetail = {
  id: string
  /** 하이픈 없는 ID */
  idPlain: string
  name: string
  desc: string
  amount: number
  status: LawsuitStatus
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
  status: '진행중',
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

/** 이 소송의 최근 작업 */
export const MOCK_RECENT_JOBS = [
  { id: 'j1', title: '소송 금액 수정 (72,000,000원 → 85,000,000원)', meta: '김효선 · TKT-2024-0520-005 · 3일 전' },
  { id: 'j2', title: '참여 유저 역할 수정 (장변호사)', meta: '박민지 · TKT-2024-0514-011 · 9일 전' },
]

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
}

export const LAWSUIT_ROLES = ['담당자', '담당 변호사', '소송 대리인', '참조']

export const MOCK_LAWSUIT_MEMBERS: LawsuitMember[] = [
  { id: 'u1', userId: 'A00112', name: '박지훈', email: 'jihoon.park@acetech.co.kr', company: '에이스테크놀로지(주)', phone: '010-2345-6789', roles: ['담당자'], dept: '인사팀', deleted: false },
  { id: 'u2', userId: 'A00145', name: '이민수', email: 'minsu.lee@acetech.co.kr', company: '에이스테크놀로지(주)', phone: '010-3456-7890', roles: ['담당 변호사'], dept: '법무팀', deleted: false },
  { id: 'u3', name: '장변호사', email: 'lawyer.jang@hankyul.co.kr', company: '법무법인 한결', phone: '010-5555-0182', roles: ['소송 대리인'], dept: '송무팀', deleted: false },
  { id: 'u4', userId: 'A00187', name: '한도윤', email: 'doyoon.han@acetech.co.kr', company: '에이스테크놀로지(주)', phone: '010-1122-3344', roles: ['참조'], dept: '경영지원실', deleted: true },
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
