// TODO: 백엔드 연동 시 제거

export type HistoryFunc = '계약' | '자문' | '소송' | '유저' | '오류 리포트' | '고객사 정보' | '컨피그'
export type HistoryType = '수정' | '추가' | '삭제' | '이관' | '추출'

export const HISTORY_FUNCS: HistoryFunc[] = ['계약', '자문', '소송', '유저', '오류 리포트', '고객사 정보', '컨피그']
export const HISTORY_USERS = ['김효선', '박민지', '이준호', '최서연']

export type HistoryCustomer = { id: string; name: string; code: string }

export const HISTORY_CUSTOMERS: HistoryCustomer[] = [
  { id: 'acetech', name: '에이스테크놀로지(주)', code: 'acetech' },
  { id: 'hanbit', name: '한빛솔루션(주)', code: 'hanbit' },
  { id: 'nuri', name: '누리건설(주)', code: 'nuri' },
  { id: 'mirae', name: '미래로지스틱스(주)', code: 'mirae' },
  { id: 'daon', name: '다온헬스케어(주)', code: 'daon' },
  { id: 'cheongun', name: '청운테크(주)', code: 'cheongun' },
]

/** 현재 선택된 고객사 (고객사 선택 후 화면) */
export const HISTORY_CURRENT_CUSTOMER = HISTORY_CUSTOMERS[0]

/** 값이 없는 상태 (변경 전 값이 이것이면 추가, 변경 후 값이 이것이면 삭제) */
export const HISTORY_EMPTY = '-'

export type HistoryDiffKind = '변경' | '추가' | '삭제'

/** 항목 하나의 원래 데이터와 수정한 데이터 */
export type HistoryDiff = { label: string; before: string; after: string; kind: HistoryDiffKind }

/** 바뀌지 않은 항목 (전체 데이터 비교에서 맥락을 보여 준다) */
export type HistoryField = { label: string; value: string }

type Template = {
  func: HistoryFunc
  type: HistoryType
  /** 대상 문서의 ID (계약 · 자문 · 소송). 문서와 관계없는 작업이면 비운다 */
  docId?: string
  target: string
  before: string
  after: string
  reason: string
  ask: string
  done: string
  /** 항목별 변경 내역 [항목, 원래 데이터, 수정한 데이터]. {at}, {user}는 처리 시각과 처리자로 바뀐다 */
  diffs: [string, string, string][]
  /** 바뀌지 않은 항목 [항목, 값] */
  keep: [string, string][]
  /** true면 수정일 · 수정자 항목을 자동으로 덧붙인다 */
  touch?: boolean
}

const TEMPLATES: Template[] = [
  {
    func: '계약',
    type: '수정',
    docId: 'CT-2024-0402',
    target: '계약 기본 정보 · CT-2024-0402',
    before: '만료일 2024-12-31',
    after: '만료일 2025-03-31',
    reason: '고객사 요청으로 계약 만료일을 연장했습니다.',
    ask: '계약 만료일을 3월 말로 연장하고 싶습니다.',
    done: '계약 CT-2024-0402의 만료일을 2025-03-31로 변경했습니다.',
    diffs: [
      ['계약 종료일', '2024-12-31', '2025-03-31'],
      ['계약 기간', '12개월', '15개월'],
      ['갱신 알림일', '2024-12-01', '2025-03-01'],
      ['자동 갱신 안내 문구', '종료 30일 전 자동 갱신', '종료 30일 전 자동 갱신 (연장 계약)'],
    ],
    keep: [
      ['계약 ID', 'CT-2024-0402'],
      ['계약명', '데이터 처리 위탁계약'],
      ['계약 시작일', '2024-01-01'],
      ['계약 금액', '36,000,000원'],
      ['언어 설정', '한국어'],
      ['계약 진행 상태', '체결 완료'],
      ['삭제 유무', '사용 중'],
    ],
    touch: true,
  },
  {
    func: '계약',
    type: '수정',
    docId: 'CT-2024-0315',
    target: '참여 유저 · 상대방 서명자',
    before: '서명 방식 이메일',
    after: '서명 방식 휴대전화 인증',
    reason: '상대방 서명자의 서명 방식 변경 요청.',
    ask: '상대방 서명자가 이메일을 확인하지 못해 휴대전화 인증으로 바꿔 주세요.',
    done: '서명 방식을 휴대전화 인증으로 변경했습니다. 서명 요청을 다시 발송했습니다.',
    diffs: [
      ['서명 종류', '이메일 인증', '휴대전화 인증'],
      ['인증 연락처', '-', '010-4821-7733'],
      ['서명 상태', '대기 (요청 발송됨)', '대기 (재발송 예정)'],
    ],
    keep: [
      ['참여 유저', '박성준 (sj.park@cloudpartners.co.kr)'],
      ['구분', '외부'],
      ['계약 내 역할', '상대방 서명자, 담당자'],
      ['회사', '(주)클라우드파트너스'],
      ['서명 방식', '회사 서명'],
      ['삭제 유무', '사용 중'],
    ],
    touch: true,
  },
  {
    func: '계약',
    type: '추가',
    docId: 'CT-2024-0315',
    target: '참여 유저 · 외부 참여자',
    before: '-',
    after: '외부 참여자 한지민 (상대방 서명자)',
    reason: '상대방 서명자 추가 요청.',
    ask: '상대방 측 서명자를 한 명 더 추가해야 합니다.',
    done: '외부 참여자 한지민 님을 상대방 서명자로 추가했습니다.',
    diffs: [
      ['이름', '-', '한지민'],
      ['이메일', '-', 'jm.han@cloudpartners.co.kr'],
      ['회사', '-', '(주)클라우드파트너스'],
      ['부서', '-', '영업본부'],
      ['전화번호', '-', '010-3377-1204'],
      ['계약 내 역할', '-', '상대방 서명자'],
      ['서명 방식', '-', '개인 서명'],
      ['서명 종류', '-', 'SMS 인증'],
      ['서명 상태', '-', '대기'],
      ['언어', '-', '한국어'],
      ['참여 일자', '-', '{at}'],
      ['삭제 유무', '-', '사용 중'],
    ],
    keep: [
      ['계약 ID', 'CT-2024-0315'],
      ['기존 참여 유저 수', '4명'],
    ],
  },
  {
    func: '계약',
    type: '수정',
    docId: 'CT-2024-0518',
    target: '워크플로우 · CT-2024-0518',
    before: '승인 단계 2단계',
    after: '승인 단계 3단계',
    reason: '내부 결재 라인 변경에 따른 워크플로우 수정.',
    ask: '결재 라인이 바뀌어 승인 단계를 하나 더 넣어야 합니다.',
    done: '승인 단계를 3단계로 수정했습니다. 진행 중인 계약에 반영됩니다.',
    diffs: [
      ['승인 단계 수', '2단계', '3단계'],
      ['법무팀 최종 승인', '불필요', '필요'],
      ['필수 계약 관련인', '불필요', '필요'],
      ['워크플로우 rev_num', 'WF-ACE-0518-041', 'WF-ACE-0518-042'],
    ],
    keep: [
      ['워크플로우 명', '표준 전자 계약 워크플로우'],
      ['계약 형태', '전자계약'],
      ['부서장 승인', '필요'],
      ['계약 첨부파일 필수', '필요'],
      ['기본 라벨', '구매, 연간 계약'],
    ],
    touch: true,
  },
  {
    func: '자문',
    type: '수정',
    docId: 'CN-2024-0205',
    target: '자문 상태 · CN-2024-0205',
    before: '검토 중',
    after: '자문 완료',
    reason: '답변 등록 후 상태가 변경되지 않는 오류 대응.',
    ask: '답변을 등록했는데 상태가 검토 중으로 남아 있습니다.',
    done: '상태를 자문 완료로 변경했습니다. 요청자에게 알림이 발송됩니다.',
    diffs: [
      ['자문 상태', '검토 중', '자문 완료'],
      ['답변 등록 일시', '-', '{at}'],
    ],
    keep: [
      ['자문 ID', 'CN-2024-0205'],
      ['자문명', '해외 고객 데이터 이전 적법성 검토'],
      ['생성일', '2024-02-05 10:20'],
      ['관리 자문', '일반 자문'],
      ['삭제 유무', '사용 중'],
    ],
    touch: true,
  },
  {
    func: '자문',
    type: '수정',
    docId: 'CN-2024-0112',
    target: '참여 유저 · 외부 변호사',
    before: '이서준 변호사',
    after: '정하윤 변호사',
    reason: '외부 변호사 교체 요청.',
    ask: '외부 변호사를 정하윤 변호사님으로 변경 부탁드립니다.',
    done: '외부 변호사를 정하윤 변호사로 변경했습니다.',
    diffs: [
      ['외부 변호사', '이서준 변호사', '정하윤 변호사'],
      ['이메일', 'lawyer.lee@hankyul.co.kr', 'hy.jung@hankyul.co.kr'],
      ['부서', '송무팀', '기업자문팀'],
      ['번호', '010-5555-0182', '010-5555-0247'],
    ],
    keep: [
      ['자문 ID', 'CN-2024-0112'],
      ['회사명', '법무법인 한결'],
      ['역할', '외부 변호사'],
      ['삭제 유무', '참여 중'],
    ],
    touch: true,
  },
  {
    func: '소송',
    type: '수정',
    docId: 'LW-2024-0087',
    target: '소송 상세 · LW-2024-0087',
    before: '상태 소송 초안 작성',
    after: '상태 소송 진행 중',
    reason: '소송 진행 단계 반영.',
    ask: '1차 기일이 잡혀 소송 상태를 소송 진행 중으로 바꿔야 합니다.',
    done: '소송 상태를 소송 진행 중으로 변경했습니다.',
    diffs: [
      ['소송 상태', '소송 초안 작성', '소송 진행 중'],
      ['사건번호', '-', '2024가합501234'],
      ['담당 재판부', '-', '서울중앙지방법원 민사 31부'],
      ['1차 변론기일', '-', '2024-06-12 14:00'],
    ],
    keep: [
      ['소송 ID', 'LW-2024-0087'],
      ['소송명', '물품대금 청구 소송'],
      ['소송 금액', '85,000,000원'],
      ['마이그레이션', 'N'],
      ['삭제 유무', '사용 중'],
    ],
    touch: true,
  },
  {
    func: '소송',
    type: '추가',
    docId: 'LW-2024-0087',
    target: '참여 유저 · 외부 변호사',
    before: '-',
    after: '외부 변호사 오지훈 변호사',
    reason: '외부 변호사 선임.',
    ask: '새로 선임한 외부 변호사를 등록해 주세요.',
    done: '외부 변호사로 오지훈 변호사를 추가했습니다.',
    diffs: [
      ['이름', '-', '오지훈'],
      ['이메일', '-', 'jh.oh@hankyul.co.kr'],
      ['user_id', '-', 'A00412'],
      ['회사명', '-', '법무법인 한결'],
      ['부서', '-', '송무팀'],
      ['번호', '-', '010-5555-0391'],
      ['역할', '-', '외부 변호사'],
      ['참여 일자', '-', '{at}'],
      ['삭제 유무', '-', '참여 중'],
    ],
    keep: [
      ['소송 ID', 'LW-2024-0087'],
      ['기존 참여 유저 수', '3명'],
    ],
  },
  {
    func: '유저',
    type: '수정',
    target: '유저 권한 · 정우성',
    before: '권한 일반',
    after: '권한 관리자',
    reason: '부서 이동에 따른 유저 정보 일괄 정정 및 권한 상향.',
    ask: '정우성 님이 법무팀으로 이동했습니다. 정보와 권한을 정정해 주세요.',
    done: '정우성 님의 유저 정보를 정정하고 권한을 관리자로 변경했습니다.',
    diffs: [
      ['이메일', 'woosung.jung@acetech.co.kr', 'ws.jung@acetech.co.kr'],
      ['전화번호', '010-2233-4455', '010-9182-7364'],
      ['사번', 'A00455', 'A00911'],
      ['부서', '영업본부', '법무팀'],
      ['직책', '과장', '차장'],
      ['시스템 내 역할', '일반유저', '일반유저, 관리자'],
      ['마지막 접속 시각', '2024-05-20 18:02:11', '2024-05-23 09:40:27'],
      ['생성일자', '2023-04-03 09:12:40', '2023-04-03 09:12:40 (정정)'],
      ['가입일자', '2023-04-03 10:01:05', '2023-04-04 08:47:19'],
      ['업데이트 일자', '2024-03-11 14:20:33', '2024-05-23 14:35:02'],
      ['활성화 유무', '비활성', '활성'],
      ['설명', '영업 지원', '부서 이동 · 법무 검토 지원 및 관리자 권한 부여'],
    ],
    keep: [
      ['PK', 'U-00231'],
      ['이름', '정우성'],
      ['마이그레이션 (Y/N)', 'N'],
    ],
  },
  {
    func: '유저',
    type: '삭제',
    target: '유저 · 퇴사자 계정',
    before: '계정 활성',
    after: '계정 삭제',
    reason: '퇴사자 계정 정리.',
    ask: '퇴사한 직원 계정을 삭제해 주세요.',
    done: '퇴사자 계정을 삭제했습니다.',
    diffs: [
      ['활성화 유무', '활성', '비활성'],
      ['삭제 유무', '사용 중', '삭제됨'],
      ['삭제일', '-', '{at}'],
      ['시스템 내 역할', '일반유저', '-'],
      ['설명', '-', '퇴사자 계정 정리'],
    ],
    keep: [
      ['PK', 'U-00318'],
      ['이름', '오세라'],
      ['이메일', 'sera.oh@acetech.co.kr'],
      ['부서', '재무팀'],
    ],
    touch: true,
  },
  {
    func: '유저',
    type: '이관',
    target: '담당 문서 12건 이관',
    before: '담당자 김민수',
    after: '담당자 박지훈',
    reason: '인사 이동으로 담당 문서를 이관했습니다.',
    ask: '김민수 님 담당 문서를 박지훈 님께 넘겨야 합니다.',
    done: '담당 문서 12건을 박지훈 님께 이관했습니다.',
    diffs: [
      ['이관 유형', '-', '계약'],
      ['이관하는 유저', '김민수 (A00201)', '-'],
      ['이관 받는 유저', '-', '박지훈 (A00112)'],
      ['이관 문서 수', '12건', '0건'],
      ['이관 문서 수 (받는 유저)', '8건', '20건'],
      ['이관 완료 문서', '-', '5건 (체결 완료)'],
      ['이관 진행중 문서', '-', '7건 (검토중 4, 서명 진행중 3)'],
      ['이관 계약 ID', '-', 'CT-2024-0402, CT-2024-0315, CT-2024-0518, CT-2024-0120, CT-2024-0207, CT-2024-0330 외 6건'],
    ],
    keep: [
      ['보안 등급 문서', '이관 제외 (0건 선택)'],
      ['이름 · 이메일 · user_id 일치 확인', '두 유저 모두 일치'],
    ],
  },
  {
    func: '오류 리포트',
    type: '추출',
    target: '계약 오류 리포트 · 11건',
    before: '-',
    after: '2024-05-01 ~ 2024-05-19 추출',
    reason: '버킷플레이스 요청 오류 현황 점검용 리포트.',
    ask: '5월 계약 오류 현황을 엑셀로 받을 수 있을까요?',
    done: '계약 오류 리포트 11건을 추출해 전달드렸습니다.',
    diffs: [
      ['리포트 종류', '-', '계약'],
      ['추출 기간', '-', '2024-05-01 ~ 2024-05-19'],
      ['추출 건수', '-', '11건'],
      ['파일 형식', '-', '엑셀 (.xlsx)'],
      ['파일명', '-', 'error_report_contract_20240501-20240519.xlsx'],
      ['추출 일시', '-', '{at}'],
      ['추출 작업자', '-', '{user}'],
    ],
    keep: [['데이터 변경', '없음 (추출만 수행)']],
  },
  {
    func: '고객사 정보',
    type: '수정',
    target: '실시간 접속 유저 강제 로그아웃',
    before: '접속 중 3명',
    after: '접속 중 0명',
    reason: '데이터 정정 작업 전 접속 유저 로그아웃.',
    ask: '데이터 정정을 위해 접속 중인 유저를 로그아웃 시켜 주세요.',
    done: '접속 중이던 유저 3명을 강제 로그아웃했습니다.',
    diffs: [
      ['접속 중인 유저 수', '3명', '0명'],
      ['김민수 (minsu.kim@acetech.co.kr)', '접속 중 · IP 10.0.4.12', '강제 로그아웃'],
      ['이서연 (seoyeon.lee@acetech.co.kr)', '접속 중 · IP 10.0.4.37', '강제 로그아웃'],
      ['박지훈 (jihoon.park@acetech.co.kr)', '접속 중 · IP 10.0.5.8', '강제 로그아웃'],
    ],
    keep: [
      ['고객사', '에이스테크놀로지(주) · acetech'],
      ['서비스', 'Buptle Biz'],
    ],
  },
  {
    func: '컨피그',
    type: '추가',
    target: '컨피그 · contract.sign.expire',
    before: '-',
    after: '만료 알림 7일 전 등록',
    reason: '누락 컨피그 등록 알림에 따른 등록.',
    ask: '서명 만료 알림 설정이 필요합니다.',
    done: '컨피그를 등록하고 적용 여부를 확인했습니다.',
    diffs: [
      ['CONFIG TYPE', '-', 'STANDALONE'],
      ['CONFIG NAME', '-', 'contract.sign.expire'],
      ['CONFIG VALUE', '-', '7'],
      ['CONFIG DESCRIPTION', '-', '서명 만료 7일 전 알림 발송'],
      ['적용일자', '-', '{at}'],
      ['등록자', '-', '{user}'],
    ],
    keep: [
      ['동일 이름 기존 컨피그', '없음'],
      ['기존 STANDALONE 컨피그 수', '4개'],
    ],
  },
]

export type HistoryChat = { from: 'staff' | 'customer'; name: string; role: string; at: string; text: string }

export type HistoryRecord = {
  id: number
  /** 대상 문서 ID. 문서와 관계없는 작업이면 빈 문자열 */
  docId: string
  /** YYYY-MM-DD HH:mm */
  at: string
  user: string
  customerId: string
  customerName: string
  ticket: string
  zendeskId: string
  func: HistoryFunc
  type: HistoryType
  target: string
  before: string
  after: string
  reason: string
  /** 바뀐 항목. 원래 데이터와 수정한 데이터를 항목마다 담는다 */
  diffs: HistoryDiff[]
  /** 바뀌지 않은 항목 */
  keep: HistoryField[]
  chat: HistoryChat[]
}

const pad = (n: number) => String(n).padStart(2, '0')

function fmt(ts: number): string {
  const d = new Date(ts)
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}

function kindOf(before: string, after: string): HistoryDiffKind {
  if (before === HISTORY_EMPTY) return '추가'
  if (after === HISTORY_EMPTY) return '삭제'
  return '변경'
}

/** 템플릿의 변경 항목을 처리 시각 · 처리자 기준으로 풀어 만든다 */
function diffOf(t: Template, at: string, user: string, before: string): HistoryDiff[] {
  const fill = (v: string) => v.replace('{at}', at).replace('{user}', user)
  const rows = t.diffs.map(([label, b, a]) => ({ label, before: fill(b), after: fill(a), kind: kindOf(b, a) }))
  if (t.touch) {
    rows.push({ label: '수정일', before, after: at, kind: '변경' }, { label: '수정자', before: '시스템 자동 기록 (이전 작업자)', after: user, kind: '변경' })
  }
  return rows
}

function makeRecords(): HistoryRecord[] {
  const others = [1, 2, 3, 4, 5]
  let ts = Date.UTC(2024, 4, 23, 14, 35)
  const rows: HistoryRecord[] = []
  for (let i = 0; i < 72; i++) {
    const customer = HISTORY_CUSTOMERS[i % 3 === 0 ? 0 : others[(i - Math.floor(i / 3) - 1) % 5]]
    const t = TEMPLATES[(i * 5) % TEMPLATES.length]
    const at = fmt(ts)
    const user = HISTORY_USERS[(i * 7 + 1) % 4]
    const earlier = (min: number) => fmt(ts - min * 60000).slice(5)
    rows.push({
      id: i,
      at,
      user,
      customerId: customer.id,
      customerName: customer.name,
      ticket: `TKT-${at.slice(0, 4)}-${at.slice(5, 7)}${at.slice(8, 10)}-${String(((i * 7) % 90) + 1).padStart(3, '0')}`,
      zendeskId: `#${458310 - i * 4}`,
      func: t.func,
      type: t.type,
      docId: t.docId ?? '',
      target: t.target,
      before: t.before,
      after: t.after,
      reason: t.reason,
      diffs: diffOf(t, at, user, fmt(ts - (3 + (i % 20)) * 86400000)),
      keep: t.keep.map(([label, value]) => ({ label, value })),
      chat: [
        { from: 'customer', name: '고객사 담당자', role: customer.name, at: earlier(95), text: t.ask },
        { from: 'staff', name: user, role: 'CS 담당자', at: earlier(88), text: '확인했습니다. 요청하신 내용으로 진행하겠습니다.' },
        { from: 'staff', name: user, role: 'CS 담당자', at: earlier(4), text: t.done },
        { from: 'customer', name: '고객사 담당자', role: customer.name, at: earlier(1), text: '확인했습니다. 감사합니다.' },
      ],
    })
    ts -= (90 + ((i * 37) % 260)) * 60000
  }
  return rows
}

/** 최신순 처리 내역 */
export const MOCK_HISTORY_RECORDS: HistoryRecord[] = makeRecords()

/** 문서(계약 · 자문 등) 하나의 처리 내역. 최신순 */
export function historyOf(func: HistoryFunc, docId: string, customerId: string = HISTORY_CURRENT_CUSTOMER.id): HistoryRecord[] {
  return MOCK_HISTORY_RECORDS.filter((r) => r.customerId === customerId && r.func === func && r.docId === docId)
}

/** 처리 내역 히스토리 화면을 해당 문서의 검색 조건으로 여는 주소 */
export function historyHref(func: HistoryFunc, docId: string): string {
  return `?history&func=${encodeURIComponent(func)}&docId=${encodeURIComponent(docId)}&mode=and`
}
