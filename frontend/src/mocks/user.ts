// TODO: 백엔드 연동 시 제거

export type SystemRole = '관리자' | '조회자' | '법무검토자' | '일반유저'

export const SYSTEM_ROLES: SystemRole[] = ['관리자', '조회자', '법무검토자', '일반유저']

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
}

export const MOCK_USERS: CompanyUser[] = [
  { id: 'u1', pk: '1452', name: '박지훈', email: 'jihoon.park@acetech.co.kr', lastLogin: '2024-05-23 09:12', roles: ['일반유저'], active: true, joinedAt: '2023-03-02 10:02:47', createdAt: '2023-03-02 09:14:22', updatedAt: '2024-05-20 15:31:08', phone: '010-2345-6789', dept: '인사팀', title: '팀장', desc: '인사 · 노무 담당', empNo: 'A00123', migrated: false },
  { id: 'u2', pk: '1453', name: '이서연', email: 'seoyeon.lee@acetech.co.kr', lastLogin: '2024-05-23 08:47', roles: ['법무검토자'], active: true, joinedAt: '2023-03-02 11:26:05', createdAt: '2023-03-02 09:14:22', updatedAt: '2024-04-11 09:48:51', phone: '010-3456-7890', dept: '법무팀', title: '변호사', desc: '계약 · 자문 검토', empNo: 'A00241', migrated: false },
  { id: 'u3', pk: '1458', name: '이민수', email: 'minsu.lee@acetech.co.kr', lastLogin: '2024-05-22 17:30', roles: ['법무검토자'], active: true, joinedAt: '2023-03-03 08:51:39', createdAt: '2023-03-02 09:14:23', updatedAt: '2024-05-22 17:31:14', phone: '010-5555-0182', dept: '법무팀', title: '수석', desc: '법무 검토 총괄', empNo: 'A00388', migrated: false },
  { id: 'u4', pk: '1611', name: '최지우', email: 'jiwoo.choi@acetech.co.kr', lastLogin: '2024-05-21 14:05', roles: ['일반유저', '조회자'], active: true, joinedAt: '2023-06-19 14:12:33', createdAt: '2023-06-19 13:40:10', updatedAt: '2024-02-07 10:05:42', phone: '010-9876-5432', dept: '구매팀', title: '대리', desc: '', empNo: 'A00402', migrated: true },
  { id: 'u5', pk: '1460', name: '정하늘', email: 'haneul.jung@acetech.co.kr', lastLogin: '2024-05-10 11:20', roles: ['관리자'], active: true, joinedAt: '2023-03-02 09:20:16', createdAt: '2023-03-02 09:14:23', updatedAt: '2024-05-10 11:22:03', phone: '010-1122-3344', dept: '경영지원실', title: '이사', desc: '시스템 관리자', empNo: 'A00517', migrated: false },
  { id: 'u6', pk: '1702', name: '한도윤', email: 'doyoon.han@acetech.co.kr', lastLogin: '2024-03-04 10:02', roles: ['조회자'], active: false, joinedAt: '2023-08-01 10:47:28', createdAt: '2023-08-01 10:05:57', updatedAt: '2024-03-04 18:00:12', phone: '010-4455-6677', dept: '영업본부', title: '과장', desc: '퇴직 처리', empNo: 'A00590', migrated: true },
  { id: 'u7', pk: '1463', name: '김효선', email: 'hyoseon.kim@acetech.co.kr', lastLogin: '2024-05-23 09:30', roles: ['관리자', '법무검토자'], active: true, joinedAt: '2023-03-02 09:58:41', createdAt: '2023-03-02 09:14:24', updatedAt: '2024-05-23 09:31:26', phone: '010-8080-1212', dept: '법무팀', title: '매니저', desc: 'CS 담당', empNo: 'A00630', migrated: false },
  { id: 'u8', pk: '2104', name: '오세훈', email: 'sehun.oh@acetech.co.kr', lastLogin: '2024-05-02 16:44', roles: ['일반유저'], active: true, joinedAt: '2024-01-15 09:16:54', createdAt: '2024-01-15 08:30:02', updatedAt: '2024-01-15 09:16:54', phone: '010-3030-4545', dept: '구매팀', title: '사원', desc: '', empNo: 'A00712', migrated: false },
]

export type DocKind = 'contract' | 'counsel' | 'lawsuit'

/** 유저가 참여 중인 문서의 ID → 제목 */
export const MOCK_DOC_TITLES: Record<DocKind, Record<string, string>> = {
  contract: {
    'CT-2024-0315': '2024 클라우드 서비스 이용계약 (갱신)', 'CT-2024-0402': '데이터 처리 위탁계약', 'CT-2024-0518': '비밀유지계약 (NDA) · 파트너사', 'CT-2024-0120': '2023 클라우드 서비스 이용계약',
    'CT-2024-0207': '유지보수 용역계약 (초안)', 'CT-2024-0330': '라이선스 추가 구매 계약', 'CT-2023-0210': '물류 운송 위탁계약', 'CT-2023-0245': '사무실 임대차 계약 (본사 3층)', 'CT-2023-0302': '광고 대행 계약',
    'CT-2023-0318': '소프트웨어 개발 용역계약', 'CT-2023-0377': '인력 파견 계약', 'CT-2023-0401': '부품 공급 기본계약', 'CT-2023-0455': '공동 마케팅 협약', 'CT-2023-0512': '데이터 라이선스 계약',
    'CT-2023-0560': '법률 자문 위임계약', 'CT-2023-0604': '보안 관제 서비스 계약', 'CT-2023-0633': '장비 리스 계약', 'CT-2023-0701': '교육 위탁 운영계약', 'CT-2023-0742': '콘텐츠 제작 계약',
    'CT-2023-0808': '판매 대리점 계약', 'CT-2023-0851': '클라우드 마이그레이션 용역', 'CT-2023-0903': '통번역 용역계약', 'CT-2023-0947': '시설 관리 용역계약', 'CT-2023-1015': '연구 개발 협약',
  },
  counsel: {
    'CN-2024-0112': '개인정보 처리방침 개정 관련 법률 자문', 'CN-2024-0205': '해외 고객 데이터 이전 적법성 검토', 'CN-2024-0318': '임직원 겸업 금지 조항 해석', 'CN-2023-1120': '파트너사 계약 해지 통지 절차',
    'CN-2024-0127': '상표권 침해 경고장 대응 (초안)', 'CN-2024-0229': '근로계약서 표준안 검토',
  },
  lawsuit: {
    'LW-2024-0087': '임금 청구 소송 (원고 3인)', 'LW-2024-0142': '상표권 침해 금지 청구', 'LW-2024-0201': '공급계약 대금 지급 청구', 'LW-2022-0310': '부당해고 구제 신청 사건',
    'LW-2023-0455': '임대차 보증금 반환 청구 (초안)', 'LW-2024-0099': '손해배상 청구 소송 (취하)',
  },
}

const MANY_CONTRACTS = ['CT-2024-0315', 'CT-2024-0518', 'CT-2024-0120', 'CT-2024-0330', 'CT-2023-1015', 'CT-2023-0947', 'CT-2023-0903', 'CT-2023-0851', 'CT-2023-0808', 'CT-2023-0742', 'CT-2023-0701', 'CT-2023-0633', 'CT-2023-0604', 'CT-2023-0560', 'CT-2023-0512', 'CT-2023-0455', 'CT-2023-0401', 'CT-2023-0377', 'CT-2023-0318', 'CT-2023-0302', 'CT-2023-0245', 'CT-2023-0210']

/** 유저별 참여 문서 ID */
export const MOCK_JOINED: Record<string, Record<DocKind, string[]>> = {
  u1: { contract: ['CT-2024-0315', 'CT-2024-0402', 'CT-2024-0207'], counsel: ['CN-2024-0229', 'CN-2024-0318'], lawsuit: ['LW-2024-0087'] },
  u2: { contract: MANY_CONTRACTS, counsel: ['CN-2024-0112', 'CN-2024-0205', 'CN-2023-1120'], lawsuit: ['LW-2024-0142', 'LW-2024-0201'] },
  u3: { contract: ['CT-2024-0402', 'CT-2024-0518'], counsel: ['CN-2024-0112', 'CN-2024-0205', 'CN-2024-0127', 'CN-2024-0229'], lawsuit: ['LW-2024-0087', 'LW-2024-0142', 'LW-2022-0310', 'LW-2024-0099'] },
  u4: { contract: ['CT-2024-0402', 'CT-2024-0207', 'CT-2024-0330'], counsel: [], lawsuit: ['LW-2024-0201'] },
  u5: { contract: ['CT-2024-0120'], counsel: ['CN-2023-1120'], lawsuit: [] },
  u6: { contract: ['CT-2024-0518'], counsel: [], lawsuit: ['LW-2023-0455'] },
  u7: { contract: ['CT-2024-0315', 'CT-2024-0402', 'CT-2024-0518', 'CT-2024-0120', 'CT-2024-0207'], counsel: ['CN-2024-0112', 'CN-2024-0318'], lawsuit: ['LW-2024-0142', 'LW-2023-0455', 'LW-2024-0099'] },
  u8: { contract: [], counsel: [], lawsuit: [] },
}

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
  자문: ['요청자', '담당 변호사', '검토자', '참조'],
  소송: ['소송 생성자', '담당자', '담당 변호사', '외부 변호사', '관련인'],
}
