/** 메인 화면 문구 */
export const main = {
  title: '고객사를 선택하세요',
  /** 조치가 필요한 알림이 있을 때 */
  titleNeedsAction: '작업이 필요한 고객사를 선택하세요',
  platformLabel: '서비스',

  search: {
    label: '고객사 검색',
    placeholder: '스키마명으로 검색',
  },

  list: {
    label: '고객사',
    title: (platform: string) => `${platform} 고객사`,
    users: (n: number) => `유저 ${n}명`,
    empty: '검색 결과가 없습니다. 스키마명을 다시 확인해 주세요.',
  },

  recent: '최근 검색',
  enter: '고객사로 이동',

  /** 고객사 선택 없이 쓰는 기능 */
  shortcuts: {
    title: '고객사 선택 없이 바로 이용',
    config: {
      title: '컨피그 관리',
      description: '컨피그를 검색하고 새 컨피그를 등록합니다.',
    },
    history: {
      title: '변경 추적 히스토리',
      description: '모든 변경 내역을 티켓 · 작업자 · 고객사로 조회합니다.',
    },
  },

  /** 컨피그 미등록 알림 */
  configMismatch: {
    title: '컨피그 불일치 · 조치 필요',
    count: (n: number) => `미등록 ${n}건`,
    message: (platform: string, lastBatchAt: string) =>
      `운영 시스템(${platform})에 적용된 컨피그가 관리 시스템에 등록되어 있지 않습니다. 확인 후 등록해 주세요. 마지막 배치 ${lastBatchAt}`,
    action: '미등록 컨피그 확인',
  },
} as const
