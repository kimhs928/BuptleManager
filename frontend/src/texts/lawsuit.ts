/** 소송 화면 문구 */
export const lawsuit = {
  breadcrumb: {
    features: '주요 기능',
    lawsuit: '소송',
  },

  won: (n: number) => `${n.toLocaleString('ko-KR')}원`,

  toast: {
    close: '닫기',
    basicSaved: (n: number, ticket: string) => `소송 ${n}개 항목이 수정되었습니다. ${ticket} 티켓으로 변경 전/후 값이 히스토리에 기록되었습니다.`,
    memberSaved: (name: string, ticket: string) => `${name} 참여 정보가 수정되었습니다. ${ticket} 티켓으로 변경 전/후 값이 히스토리에 기록되었습니다.`,
    memberAdded: (name: string, ticket: string) => `"${name}" 님을 참여 유저로 추가했습니다. ${ticket} 티켓으로 히스토리에 기록되었습니다.`,
  },

  none: '(없음)',

  /** 소송 검색 */
  search: {
    title: '소송 검색',
    label: '소송 ID 또는 소송명',
    placeholder: '소송 ID (LW-2024-0087 / 20240087) 또는 소송명',
    clear: '검색어 지우기',
    submit: '검색',
    includeDeleted: '삭제된 소송 포함',
    recentTitle: '최근 조회한 소송',
    resultTitle: '검색 결과',
    count: (n: number, includeDeleted: boolean) => `${n}건${includeDeleted ? ' · 삭제 포함' : ''}`,
    columns: {
      id: '소송 ID',
      name: '소송명',
      status: '상태',
      amount: '소송 금액',
      migrated: '마이그레이션',
      members: '참여',
    },
    migrated: { true: '예', false: '아니오' },
    members: (n: number) => `${n}명`,
    created: (d: string) => `생성 ${d}`,
    deleted: '삭제됨',
    detail: '상세 보기',
    emptyTitle: '검색 결과가 없습니다',
    emptyDescription: (q: string) => ['"' + q + '"에 해당하는 소송이 없습니다.', '소송 ID 형식(00000-0000 / 00000000)이나 고객사 선택이 맞는지 확인해 주세요.'],
  },

  /** 상세 상단 (축약 검색 · 헤더 · 탭) */
  header: {
    searchLabel: '소송 검색',
    searchPlaceholder: '소송 ID 또는 소송명',
    searchSubmit: '검색',
    searchHint: 'ID는 00000-0000 / 00000000 모두 가능 · 삭제된 소송 포함',
    status: '상태',
    migrated: '마이그레이션',
    deleted: '삭제됨',
    tabsLabel: '소송 탭',
    tabs: { basic: '기본 정보', members: '참여 유저' },
  },

  /** 기본 정보 탭 */
  basic: {
    title: '소송 기본 정보',
    edit: '수정',
    fields: {
      id: '소송 ID',
      status: '상태',
      name: '소송명',
      desc: '소송 설명',
      amount: '소송 금액',
      migrated: '마이그레이션',
      deleted: '삭제 유무',
      updatedAt: '수정일',
    },
    migrated: { true: '예', false: '아니오' },
    deletedYes: '삭제됨',
    deletedNo: '사용 중',
    emptyDesc: '-',
    courtTitle: '연동 정보',
    courtBadge: '대법원 연동',
    linked: '연동됨',
    syncedAt: (at: string) => `최근 동기화 ${at}`,
    readOnly: '읽기 전용',
    courtNote: '기일 · 결과는 대법원 사건 정보와 매일 자동 동기화됩니다.',
    courtLink: '대법원 사건 검색에서 보기',
    recentTitle: '이 소송의 최근 작업',
  },

  basicEdit: {
    title: '소송 상세 정보 수정',
    description: (id: string) => `${id} · 변경 전/후 값이 히스토리에 함께 저장됩니다.`,
    action: '소송 · 상세 정보 수정',
    groups: { info: '소송 정보', amount: '소송 금액', state: '상태 · 삭제' },
    fields: { name: '소송명', desc: '소송 설명', amount: '소송 금액 (원)', status: '상태', deleted: '삭제 유무' },
    changeLabels: { name: '소송명', desc: '소송 설명', amount: '소송 금액', status: '상태', deleted: '삭제 유무' },
    deletedOptions: { false: '사용 중', true: '삭제됨' },
  },

  /** 참여 유저 탭 */
  members: {
    title: '소송 참여 유저',
    description: '유저 역할과 삭제 유무만 수정할 수 있습니다. 삭제된 참여자도 함께 표시됩니다.',
    includeDeleted: '삭제된 유저 포함',
    summary: (total: number, internal: number, external: number) => `${total}명 · 내부 ${internal} · 외부 ${external}`,
    footer: '모든 변경은 티켓 번호와 사유와 함께 변경 히스토리에 기록됩니다.',
    add: '추가',
    columns: { user: '유저', company: '회사명', dept: '부서', phone: '번호', roles: '역할', deleted: '삭제 유무', action: '작업' },
    deleted: '삭제됨',
    deletedLabel: '삭제',
    active: '사용',
    edit: '수정',
  },

  memberEdit: {
    title: (name: string) => `참여 유저 수정 · ${name}`,
    description: (id: string) => `${id} · 변경 전/후 값이 히스토리에 저장됩니다.`,
    action: '소송 · 참여 유저 수정',
    groups: { info: '유저 정보', roles: '유저 역할', deleted: '삭제 여부' },
    rolesNote: '· 복수 선택',
    fixed: '변경 불가',
    fields: { name: '이름', email: '이메일', org: '소속 · 부서', roles: '유저 역할', deleted: '삭제 유무' },
    deletedOptions: { false: '참여 중', true: '삭제됨' },
  },

  memberAdd: {
    title: '소송 참여 유저 추가',
    description: '에이스테크놀로지(주) 유저의 이름 · 이메일 · user_id가 모두 일치해야 추가됩니다. 추가 내역이 히스토리에 기록됩니다.',
    action: '소송 · 참여 유저 추가',
    save: '실행',
    groups: { info: '유저 정보', setting: '참여 설정' },
    fields: { name: '이름', email: '이메일', userId: 'user_id' },
    emailPlaceholder: 'name@acetech.co.kr',
    userIdPlaceholder: '예: A00388',
    confirmed: '확인된 유저 정보',
    rolesLabel: '유저 역할',
    rolesNote: '· 복수 선택',
    activeNote: '추가된 유저는 ‘사용’ 상태로 참여합니다.',
    change: '참여 유저 추가',
    noRole: '역할 미선택',
    match: {
      idle: '에이스테크놀로지(주) 유저는 유저명, 이메일, user_id가 모두 일치해야 추가할 수 있습니다.',
      ok: '사내 유저와 일치합니다. 유저명, 이메일, user_id 3개 항목이 모두 확인되었습니다.',
      bad: '일치하는 사내 유저가 없습니다. 유저명, 이메일, user_id가 정확히 같아야 추가할 수 있습니다.',
      joined: '이미 참여 중인 유저입니다. 역할 변경은 참여 유저 수정에서 합니다.',
      deletedJoined: '삭제된 참여자입니다. 다시 참여시키려면 참여 유저 수정에서 삭제 유무를 변경하세요.',
    },
  },
} as const
