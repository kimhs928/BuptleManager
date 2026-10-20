// TODO: 백엔드 연동 시 제거
import type { ServicePlatform } from '../lib/platform'

export type CompanyDetail = {
  platform: ServicePlatform
  name: string
  schema: string
  domain: string
  active: boolean
  representative: string
  businessNo: string
  phone: string
  createdAt: string
  users: number
  userLimit: number
  address: string
}

export const MOCK_COMPANY_DETAIL: CompanyDetail = {
  platform: 'BUPTLE_BIZ',
  name: '에이스테크놀로지(주)',
  schema: 'acetech',
  domain: 'ace-tech.buptle.app',
  active: true,
  representative: '김민수',
  businessNo: '123-45-67890',
  phone: '02-1234-5678',
  createdAt: '2024-03-15',
  users: 128,
  userLimit: 200,
  address: '서울특별시 강남구 테헤란로 123, 에이스빌딩 12층',
}

/** 운영 현황 (현재 접속·적용 컨피그 수는 화면에서 계산) */
export const MOCK_OPS = { jobs: 9, tickets: 2 } as const

export const MOCK_RECENT_JOBS = [
  { id: 'job1', title: '계약 CT-2024-0315 참여 유저 수정', meta: '박민지 · TKT-2024-0523-002 · 2일 전' },
  { id: 'job2', title: '세션 강제 로그아웃 (1명)', meta: '김효선 · TKT-2024-0521-007 · 4일 전' },
  { id: 'job3', title: '유저 데이터 추출 (128명)', meta: '이준호 · TKT-2024-0518-011 · 1주 전' },
]

export type ConfigScope = 'COMPONENT' | 'MODULES' | 'STANDALONE'

export type ConfigRow = {
  /** 목록 key (같은 이름이 타입별로 중복될 수 있음) */
  id: string
  scope: ConfigScope
  name: string
  description: string
  /** 값이 있는 컨피그(STANDALONE)만 사용 */
  value: string
  appliedAt: string
  appliedBy: string
}

export type PublicConfigRow = Omit<ConfigRow, 'scope' | 'value'>

/** 값이 매우 긴 컨피그 예시 (200명 분의 수신 제외 대상) */
const NOTIFY_DISABLED_LIST_VALUE = JSON.stringify({ excludedUserIds: Array.from({ length: 200 }, (_, i) => `U-${String(1001 + i).padStart(5, '0')}`) }, null, 2)

export const MOCK_CONFIGS: ConfigRow[] = [
  { id: 'c1', scope: 'MODULES', name: 'FILE_ATTACH_REQUIRED_IN_NEW_CONTRACT', description: '신규 계약 생성 시 파일 첨부를 필수로 지정', value: '', appliedAt: '2024-03-15', appliedBy: '이준호' },
  { id: 'c2', scope: 'MODULES', name: 'COMPONENT', description: '컴포넌트 기능 모듈 사용', value: '', appliedAt: '2024-03-15', appliedBy: '이준호' },
  { id: 'c3', scope: 'MODULES', name: 'COUNSEL_MANAGE', description: '자문 관리 모듈 사용', value: '', appliedAt: '2024-05-02', appliedBy: '박민지' },
  { id: 'c4', scope: 'COMPONENT', name: 'ENABLE_PDF_UPLOAD', description: '계약서 PDF 파일 업로드 기능 사용', value: '', appliedAt: '2024-03-15', appliedBy: '이준호' },
  { id: 'c5', scope: 'COMPONENT', name: 'CMPNT055_CONTRACT_LIST_BY_DEPT', description: '부서별 계약 목록 조회 기능', value: '', appliedAt: '2024-06-11', appliedBy: '박민지' },
  { id: 'c6', scope: 'MODULES', name: 'ENABLE_PDF_UPLOAD', description: 'PDF 업로드 모듈 사용', value: '', appliedAt: '2024-03-15', appliedBy: '이준호' },
  { id: 'c7', scope: 'COMPONENT', name: 'CMPNT416_MENTION_SERVICE', description: '코멘트 내 사용자 멘션(@) 기능', value: '', appliedAt: '2024-03-20', appliedBy: '이준호' },
  { id: 'c8', scope: 'STANDALONE', name: 'NOTIFY_DISABLED_LIST', description: '알림 수신 제외 대상 목록', value: NOTIFY_DISABLED_LIST_VALUE, appliedAt: '2024-03-15', appliedBy: '이준호' },
  // 디자인 시안에 컨피그명이 비어 있던 행. 이름은 임시 값이며 API 연동 시 실제 값으로 대체
  { id: 'c9', scope: 'STANDALONE', name: 'SESSION_TIMEOUT_MINUTES', description: '세션 만료 시간(분)', value: '60', appliedAt: '2024-03-15', appliedBy: '이준호' },
  { id: 'c10', scope: 'STANDALONE', name: 'BLOCK_DUPLICATE_LOGIN', description: '동일 계정 동시 로그인 차단', value: 'true', appliedAt: '2024-09-02', appliedBy: '김효선' },
  { id: 'c11', scope: 'STANDALONE', name: 'MAIL_SENDER_NAME', description: '발송 메일 표시 이름', value: '에이스테크 법무팀', appliedAt: '2024-04-08', appliedBy: '박민지' },
  { id: 'c12', scope: 'COMPONENT', name: 'WORKFLOW_LOCK_PREVIOUS_VERSION', description: '워크플로우 개정 시 이전 버전 자동 잠금', value: '', appliedAt: '2024-07-19', appliedBy: '박민지' },
]

/** 값이 없는 PUBLIC 컨피그 */
export const MOCK_PUBLIC_CONFIGS: PublicConfigRow[] = [
  { id: 'p1', name: 'PUBLIC_SERVICE_NOTICE', description: '서비스 공지 배너 노출', appliedAt: '2024-03-15', appliedBy: '이준호' },
  { id: 'p2', name: 'PUBLIC_TERMS_V3', description: '이용약관 v3 동의 절차 적용', appliedAt: '2024-08-01', appliedBy: '김효선' },
  { id: 'p3', name: 'PUBLIC_MAINTENANCE_MODE', description: '정기 점검 시간 접속 제한 안내', appliedAt: '2024-09-10', appliedBy: '박민지' },
]

export const MOCK_CONFIG_SYNCED_AT = '오늘 08:30'

export type LiveUser = {
  id: string
  name: string
  email: string
  employeeNo: string
  ip: string
  session: string
  lastActive: string
  /** 최근 활동 중(초록 점) 여부 */
  recent: boolean
  loginAt: string
}

export const MOCK_LIVE_USERS: LiveUser[] = [
  { id: 'u1', name: '김민수', email: 'minsu.kim@acetech.co.kr', employeeNo: 'A00123', ip: '211.34.12.8', session: 'sess_8f2a…c91d', lastActive: '방금 전', recent: true, loginAt: '2024-05-23 09:12' },
  { id: 'u2', name: '이서연', email: 'seoyeon.lee@acetech.co.kr', employeeNo: 'A00241', ip: '211.34.12.19', session: 'sess_17b0…e4a2', lastActive: '2분 전', recent: true, loginAt: '2024-05-23 09:03' },
  { id: 'u3', name: '박준호', email: 'junho.park@acetech.co.kr', employeeNo: 'A00388', ip: '121.160.77.5', session: 'sess_c4d9…0b77', lastActive: '11분 전', recent: false, loginAt: '2024-05-23 08:47' },
  { id: 'u4', name: '최지우', email: 'jiwoo.choi@acetech.co.kr', employeeNo: 'A00402', ip: '211.34.12.33', session: 'sess_a91e…52f8', lastActive: '18분 전', recent: false, loginAt: '2024-05-23 08:31' },
  { id: 'u5', name: '정하늘', email: 'haneul.jung@acetech.co.kr', employeeNo: 'A00517', ip: '175.223.14.90', session: 'sess_6e3b…7d10', lastActive: '35분 전', recent: false, loginAt: '2024-05-23 08:20' },
  { id: 'u6', name: '한도윤', email: 'doyoon.han@acetech.co.kr', employeeNo: 'A00590', ip: '211.34.12.41', session: 'sess_02ff…b6c3', lastActive: '52분 전', recent: false, loginAt: '2024-05-23 07:58' },
]
