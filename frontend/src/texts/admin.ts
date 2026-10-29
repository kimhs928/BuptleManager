export const admin = {
  breadcrumb: { admin: '관리자' },
  title: '관리자',
  subtitle: '운영 데이터를 수동으로 관리합니다.',

  sync: {
    title: '데이터 연동',
    source: 'Buptle Biz 고객사 데이터',
    description: 'Buptle Biz의 고객사 정보를 BuptleManager로 가져옵니다. 이미 있는 고객사는 정보를 갱신하고, 없는 고객사는 새로 추가합니다.',
    note: '연동 중에는 다시 누를 수 없습니다. 연동한 내용은 연동 이력에 남습니다.',
    button: '고객사 데이터 연동',
    running: '연동 중입니다…',
    lastLabel: '마지막 연동',
    neverSynced: '아직 연동한 적이 없습니다.',
    resultTitle: '연동 결과',
    done: (at: string) => `${at}에 연동을 마쳤습니다.`,
    failed: '연동에 실패했습니다. 잠시 후 다시 시도해 주세요.',
    counts: { scanned: '조회', created: '추가', updated: '갱신', unchanged: '변경 없음', failed: '실패' },
    unit: '곳',
  },

  runs: {
    title: '연동 이력',
    empty: '연동 이력이 없습니다.',
    columns: { at: '연동 일시', trigger: '실행 방식', operator: '실행자', result: '결과', summary: '내용' },
    trigger: { manual: '수동', auto: '자동' },
    status: { SUCCEEDED: '성공', FAILED: '실패' },
    summary: (created: number, updated: number, failed: number) => `추가 ${created} · 갱신 ${updated}${failed > 0 ? ` · 실패 ${failed}` : ''}`,
  },
} as const
