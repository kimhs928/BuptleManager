/** 자문 화면 문구 */
export const counsel = {
  breadcrumb: {
    features: '주요 기능',
    counsel: '자문',
  },

  toast: {
    close: '닫기',
    basicSaved: (n: number, ticket: string) => `자문 기본 정보 ${n}개 항목이 수정되었습니다. ${ticket} 티켓으로 변경 전/후 값이 히스토리에 기록되었습니다.`,
    memberSaved: (name: string, ticket: string) => `${name} 참여 정보가 수정되었습니다. ${ticket} 티켓으로 변경 전/후 값이 히스토리에 기록되었습니다.`,
    memberAdded: (name: string, ticket: string) => `"${name}" 님을 참여 유저로 추가했습니다. ${ticket} 티켓으로 히스토리에 기록되었습니다.`,
    historySaved: (action: string, fields: string, ticket: string) => `자문 히스토리 "${action}" 액션 수정 완료 (${fields}). ${ticket} 티켓으로 변경 전/후 값이 히스토리에 기록되었습니다.`,
    commentSaved: (ticket: string) => `코멘트가 수정되었습니다. ${ticket} 티켓으로 변경 전/후 값이 히스토리에 기록되었습니다.`,
  },

  none: '(없음)',

  /** 자문 검색 */
  search: {
    title: '자문 검색',
    label: '자문 ID 또는 자문명',
    placeholder: '자문 ID (CN-2024-0112 / 20240112) 또는 자문명',
    clear: '검색어 지우기',
    submit: '검색',
    includeDeleted: '삭제된 자문 포함',
    recentTitle: '최근 조회한 자문',
    resultTitle: '검색 결과',
    count: (n: number, includeDeleted: boolean) => `${n}건${includeDeleted ? ' · 삭제 포함' : ''}`,
    columns: {
      id: '자문 ID',
      name: '자문명',
      status: '자문 단계',
      requester: '요청자',
      lawyer: '담당 변호사',
      members: '참여',
    },
    members: (n: number) => `${n}명`,
    created: (d: string) => `생성 ${d}`,
    deleted: '삭제됨',
    detail: '상세 보기',
    emptyTitle: '검색 결과가 없습니다',
    emptyDescription: (q: string) => ['"' + q + '"에 해당하는 자문이 없습니다.', '자문 ID 형식(00000-0000 / 00000000)이나 고객사 선택이 맞는지 확인해 주세요.'],
  },

  /** 상세 상단 (축약 검색 · 헤더 · 탭) */
  header: {
    searchLabel: '자문 검색',
    searchPlaceholder: '자문 ID 또는 자문명',
    searchSubmit: '검색',
    searchHint: 'ID는 00000-0000 / 00000000 모두 가능 · 삭제된 자문 포함',
    status: '자문 단계',
    managed: '관리 자문',
    deleted: '삭제됨',
    tabsLabel: '자문 탭',
    tabs: { basic: '기본 정보', members: '참여 유저', process: '프로세스 · 히스토리', comments: '코멘트' },
  },

  /** 기본 정보 탭 */
  basic: {
    title: '자문 기본 정보',
    edit: '수정',
    fields: {
      id: '자문 ID',
      status: '자문 단계',
      name: '자문명',
      createdAt: '생성일',
      updatedAt: '수정일',
      deleted: '삭제 유무',
      deletedAt: '삭제일',
      managed: '관리 자문',
    },
    deletedYes: '삭제됨',
    deletedNo: '사용 중',
    managedYes: '관리 자문',
    managedNo: '일반 자문',
    linksTitle: '연결 정보',
    links: { members: '참여 유저', history: '히스토리', comments: '코멘트' },
    persons: (n: number) => `${n}명`,
    cases: (n: number) => `${n}건`,
    editHint: '자문 기본 정보 · 상태 · 날짜',
    recentTitle: '최근 히스토리',
    recentAll: (n: number) => `전체 ${n}건`,
    recentEmpty: '히스토리가 없습니다.',
  },

  basicEdit: {
    title: '자문 기본 정보 수정',
    description: (id: string) => `${id} · 변경 전/후 값이 히스토리에 함께 저장됩니다.`,
    action: '자문 · 기본 정보 수정',
    groups: { info: '자문 정보', dates: '날짜', deleted: '삭제 여부' },
    fields: { id: '자문 ID', status: '자문 상태', name: '자문명', createdAt: '생성일', updatedAt: '수정일', deleted: '삭제 유무' },
    deletedOptions: { false: '사용 중', true: '삭제됨' },
  },

  /** 참여 유저 탭 */
  members: {
    title: '자문 참여 유저',
    description: '이름과 이메일은 변경할 수 없습니다.',
    includeDeleted: '삭제된 유저 포함',
    summary: (total: number, internal: number, external: number) => `${total}명 · 내부 ${internal} · 외부 ${external}`,
    addLabel: '자문 참여 유저 추가',
    add: '추가',
    columns: { user: '유저', company: '회사명', phone: '번호', roles: '역할', dept: '부서', deleted: '삭제 유무', action: '작업' },
    deleted: '삭제',
    active: '사용',
    edit: '수정',
    footer: '모든 변경은 티켓 번호와 사유와 함께 변경 히스토리에 기록됩니다.',
  },

  memberEdit: {
    title: (name: string) => `참여 유저 수정 · ${name}`,
    description: (id: string) => `${id} · 변경 전/후 값이 히스토리에 저장됩니다.`,
    action: '자문 · 참여 유저 수정',
    groups: { info: '유저 정보', roles: '역할', deleted: '삭제 여부' },
    rolesNote: '· 복수 선택',
    fields: { name: '이름', email: '이메일', company: '회사명', phone: '번호', dept: '부서', roles: '역할', deleted: '삭제 유무' },
    deletedOptions: { false: '참여 중', true: '삭제됨' },
  },

  memberAdd: {
    title: '자문 참여 유저 추가',
    description: '에이스테크놀로지(주) 유저의 이름 · 이메일 · user_id가 모두 일치해야 추가됩니다. 추가 내역이 히스토리에 기록됩니다.',
    action: '자문 · 참여 유저 추가',
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

  /** 프로세스 · 히스토리 탭 */
  process: {
    workflowTitle: '자문 워크플로우',
    readOnly: '수정 불가',
    settingTitle: '01. 워크플로우 설정',
    processTitle: '02. 자문 프로세스',
    stateLabel: { done: '완료', current: '진행 중', pending: '대기' },
    empty: '없음',
    historyTitle: '자문 진행 히스토리',
    legend: { forward: '순방향 액션', backward: '역방향 액션', deleted: '삭제된 이력', current: '현재 단계' },
    laneLabel: (i: number, last: boolean) => `${i}차 진행${last ? ' · 진행 중' : ''}`,
    current: '현재',
    deleted: '삭제됨',
    comment: '코멘트',
    editLabel: (action: string) => `${action} 이력 수정`,
  },

  historyEdit: {
    title: '히스토리 액션 수정',
    description: '액션 유저 · 액션 일자 · 삭제 유무 · 코멘트를 수정할 수 있습니다. 변경 전/후 값이 히스토리에 함께 저장됩니다.',
    action: '자문 · 히스토리 액션 수정',
    groups: { info: '액션 정보', edit: '수정 항목' },
    fields: { type: '액션 타입', move: '액션 전 → 액션 후', user: '액션 유저', at: '액션 일자', deleted: '삭제 유무', comment: '코멘트' },
    userHint: '자문 참여 유저만 선택할 수 있습니다.',
    deletedOptions: { N: 'N (사용)', Y: 'Y (삭제)' },
    emptyComment: '(비움)',
  },

  /** 코멘트 탭 */
  comments: {
    title: '자문 코멘트',
    description: '코멘트 내용과 삭제 유무만 수정할 수 있습니다. 작성자, 타입, 일자는 변경할 수 없습니다.',
    total: (n: number, deleted: number) => `총 ${n}건 · 삭제 ${deleted}건`,
    columns: { text: '자문 코멘트', type: '코멘트 타입', author: '작성 유저', at: '코멘트 일자', updatedAt: '수정일', deleted: '삭제 유무', deletedAt: '삭제일', action: '작업' },
    more: '자세히 보기',
    deleted: '삭제',
    active: '사용',
    edit: '수정',
    footer: '모든 변경은 티켓 번호와 사유와 함께 변경 히스토리에 기록됩니다.',
  },

  commentView: {
    title: '자문 코멘트',
    written: (at: string) => `작성 ${at}`,
    modified: (at: string) => `수정 ${at}`,
  },

  commentEdit: {
    title: '자문 코멘트 수정',
    description: (id: string) => `${id} · 변경 전/후 값이 히스토리에 저장됩니다.`,
    action: '자문 · 코멘트 수정',
    groups: { info: '코멘트 정보', comment: '코멘트', deleted: '삭제 여부', history: '이력 정보' },
    fields: { author: '작성 유저', type: '코멘트 타입', at: '코멘트 일자', text: '자문 코멘트', deleted: '삭제 유무', updatedAt: '수정일' },
    autoUpdate: '자동 갱신',
    deletedOptions: { false: '사용 중', true: '삭제됨' },
  },
} as const
