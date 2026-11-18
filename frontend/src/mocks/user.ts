// TODO: 백엔드 연동 시 제거

/** 시스템 내 역할 이름. 값과 이름은 enum 표 BIZ_USER_SYSTEM_ROLE 에서 읽는다 */
export type SystemRole = string

/** 날짜 시각은 'YYYY-MM-DD HH:mm(:ss)' 형식 */
export type CompanyUser = {
  id: string
  pk: string
  name: string
  email: string
  lastLogin: string
  roles: SystemRole[]
  active: boolean
  joinedAt: string
  createdAt: string
  updatedAt: string
  phone: string
  dept: string
  title: string
  desc: string
  empNo: string
  migrated: boolean
  /** 참여 중인 문서 수 */
  docCounts: { contract: number; counsel: number; lawsuit: number }
}

export type DocKind = 'contract' | 'counsel' | 'lawsuit'

/** 이관에서 이름·이메일·user_id가 모두 일치해야 선택되는 사내 유저 */
export const MOCK_TRANSFER_DIRECTORY = [
  { name: '박지훈', email: 'jihoon.park@acetech.co.kr', userId: 'A00123' },
  { name: '이서연', email: 'seoyeon.lee@acetech.co.kr', userId: 'A00241' },
  { name: '최지우', email: 'jiwoo.choi@acetech.co.kr', userId: 'A00402' },
]

export type TransferType = '계약' | '자문' | '소송'

export type TransferDoc = {
  id: string
  title: string
  roles: string[]
  status: '진행중' | '완료'
  grade: '일반' | '보안'
  createdAt: string
}

export const MOCK_TRANSFER_DOCS: Record<TransferType, TransferDoc[]> = {
  계약: [
    { id: 'CT-2024-0315', title: '2024 클라우드 서비스 이용계약 (갱신)', roles: ['기안자'], status: '진행중', grade: '일반', createdAt: '2024-03-15' },
    { id: 'CT-2024-0402', title: '데이터 처리 위탁계약', roles: ['기안자', '서명인'], status: '진행중', grade: '일반', createdAt: '2024-04-02' },
    { id: 'CT-2024-0518', title: '비밀유지계약 (NDA) · 파트너사', roles: ['검토자'], status: '진행중', grade: '보안', createdAt: '2024-05-18' },
    { id: 'CT-2024-0120', title: '2023 클라우드 서비스 이용계약', roles: ['부서장', '서명인'], status: '완료', grade: '일반', createdAt: '2023-03-10' },
    { id: 'CT-2024-0207', title: '유지보수 용역계약', roles: ['기안자'], status: '완료', grade: '일반', createdAt: '2024-02-07' },
    { id: 'CT-2024-0330', title: '라이선스 추가 구매 계약', roles: ['관련인'], status: '완료', grade: '보안', createdAt: '2024-03-30' },
    { id: 'CT-2024-0411', title: '임대차 계약 (사무실 연장)', roles: ['최종승인자'], status: '진행중', grade: '일반', createdAt: '2024-04-11' },
    { id: 'CT-2024-0502', title: '외주 개발 용역계약', roles: ['검토자', '기타'], status: '완료', grade: '일반', createdAt: '2024-05-02' },
  ],
  자문: [
    { id: 'CN-2024-0112', title: '개인정보 처리방침 개정 관련 법률 자문', roles: ['요청자'], status: '완료', grade: '일반', createdAt: '2024-01-12' },
    { id: 'CN-2024-0205', title: '해외 고객 데이터 이전 적법성 검토', roles: ['요청자', '참조'], status: '진행중', grade: '일반', createdAt: '2024-02-05' },
    { id: 'CN-2024-0318', title: '임직원 겸업 금지 조항 해석', roles: ['검토자'], status: '진행중', grade: '보안', createdAt: '2024-03-18' },
  ],
  소송: [
    { id: 'LW-2024-0087', title: '임금 청구 소송 (원고 3인)', roles: ['담당자'], status: '진행중', grade: '일반', createdAt: '2024-02-08' },
    { id: 'LW-2024-0142', title: '상표권 침해 금지 청구', roles: ['관련인'], status: '진행중', grade: '일반', createdAt: '2024-03-21' },
  ],
}

/** 이관 유형별 내 역할 필터 */
export const TRANSFER_ROLE_SETS: Record<TransferType, string[]> = {
  계약: ['기안자', '검토자', '최종승인자', '부서장', '관련인', '서명인', '기타'],
  자문: ['요청자', '외부 변호사', '검토자', '참조'],
  소송: ['소송 생성자', '담당자', '담당 변호사', '외부 변호사', '관련인'],
}
