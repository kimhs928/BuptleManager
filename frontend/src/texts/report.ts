/** 오류 리포트 추출 화면 문구 */
export const report = {
  breadcrumb: { features: '주요 기능', report: '오류 리포트 추출' },

  title: '오류 리포트 추출',
  description: (company: string) =>
    `${company}의 오류 리포트를 종류와 기간으로 선택해 엑셀 파일로 추출합니다. 1, 2를 선택하면 추출 요약이 나타납니다. 추출 작업은 변경 히스토리에 기록됩니다.`,

  done: {
    title: '추출이 완료되었습니다',
    detail: (name: string, count: number, ticket: string) => `${name} · ${count}건 · ${ticket} 티켓으로 변경 히스토리에 기록되었습니다`,
    download: '다시 다운로드',
    close: '닫기',
  },

  step1: {
    title: '1. 리포트 종류',
    kinds: {
      contract: { label: '계약 오류 리포트', desc: '계약 생성, 서명 요청, 워크플로우, 문서 업로드 등 계약 처리 중 발생한 오류를 추출합니다.' },
      counsel: { label: '자문 오류 리포트', desc: '자문 접수, 상태 변경, 알림 발송, 코멘트 저장 등 자문 처리 중 발생한 오류를 추출합니다.' },
    },
  },

  step2: {
    title: '2. 추출 기간',
    from: '시작일',
    to: '종료일',
    quick: '빠른 선택',
    presets: { week: '최근 7일', month: '최근 30일', thisMonth: '이번 달', lastMonth: '지난 달' },
    invalid: '종료일이 시작일보다 빠릅니다. 기간을 다시 선택해 주세요.',
  },

  step3: {
    title: '추출 요약',
    hint: '1. 리포트 종류와 2. 추출 기간을 모두 선택하면 이곳에 추출 요약과 엑셀 추출 버튼이 나타납니다.',
    kind: '리포트 종류',
    period: '추출 기간',
    format: '파일 형식',
    formatValue: '엑셀 (.xlsx)',
    unit: (n: number) => `${n}건`,
    extract: '엑셀 추출',
    noteEmpty: '데이터가 없어 추출할 수 없습니다',
  },

  confirm: {
    title: '오류 리포트 추출',
    action: '오류 리포트 · 추출',
    run: '실행',
    conditions: '추출 조건',
    labels: { kind: '리포트 종류', period: '기간', count: '추출 건수', file: '파일' },
    privacy: '추출 파일은 개인정보가 포함될 수 있습니다. 업무 목적 외에는 사용하지 말고 사용 후 폐기해 주세요. 추출 작업자와 일시, 조건이 변경 히스토리에 기록됩니다.',
  },
} as const
