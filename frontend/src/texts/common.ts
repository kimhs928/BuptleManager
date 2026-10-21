/** 공통 문구 */
export const common = {
  appName: 'BuptleManager',
  systemName: '운영관리 시스템',
  logoAlt: 'Buptle 로고',
  consoleLabel: '통합 운영 콘솔',

  /** 서비스별 표시 이름 */
  platform: {
    BUPTLE_BIZ: 'Buptle Biz',
    BUPTLE_NOVA: 'Buptle Nova',
  },

  network: {
    internalOnly: '내부 전용 · 사내 네트워크',
  },

  footer: {
    copyright: '© Buptle',
    authorizedOnly: '허가된 담당자 전용',
    version: 'v0.0.1',
  },

  action: {
    cancel: '취소',
    close: '닫기',
    search: '검색',
  },

  state: {
    loading: '로딩 중',
    noResult: '결과가 없습니다.',
  },

  header: {
    companyNotSelected: '고객사 미선택',
    notification: '알림',
  },

  field: {
    readOnly: '수정 불가',
  },

  notice: {
    later: '나중에 확인',
  },

  /** 수정 모달 공통 */
  editModal: {
    defaultDescription: '변경 전/후 값이 히스토리에 함께 저장됩니다.',
    asideLabel: '변경 항목 및 히스토리 기록',
    save: '저장 · 히스토리 기록',
    changes: {
      title: '변경 항목',
      empty: '아직 변경한 항목이 없습니다.',
    },
    ticket: {
      label: 'Zendesk 티켓 번호',
      placeholder: 'TKT-2024-0523-001',
    },
    requester: {
      label: '작업 요청자',
      placeholder: '요청자 이름',
    },
    reason: {
      label: '작업 사유',
      placeholder: '고객사 요청 내용 또는 내부 처리 사유',
    },
    audit: {
      actor: '액션 유저',
      at: '액션 시각',
      company: '고객사',
      action: '작동 기능',
    },
  },
} as const
