/** 로그인 화면 문구 (여러 줄은 배열) */
export const login = {
  title: '운영관리 시스템',
  subtitle: 'Naver works 계정으로만 로그인할 수 있습니다.',
  button: 'Naver Works 로그인',
  buttonBusy: '인증 페이지로 이동 중',
  redirectHint: '버튼을 누르면 네이버 웍스 인증 페이지로 이동합니다.',
  noAccess: {
    prefix: '접근 권한이 없다면',
    link: '담당자에게 문의',
  },

  /** 사내망 외 접속 */
  network: {
    message: ['외부 네트워크에서는 접속할 수 없습니다.'],
    emphasis: 'Buptle 내부 네트워크로 접속해주세요',
  },

  /** 미등록 계정 */
  denied: {
    title: '접근 권한이 없습니다',
    message: ['해당 계정은 BuptleManager 사용 권한이 없습니다.', '담당자에게 권한을 요청해주세요.'],
    verified: 'Naver Works 인증됨',
    noPermission: '권한 없음',
    requestInfoTitle: '권한 요청 시 전달할 정보',
    requestInfo: {
      account: '계정',
      roleType: '권한 타입',
      roleTypeValue: 'CS 담당자 / 개발자 / 관리자 중 선택',
      channel: '요청 경로',
      channelValue: '담당자 네이버 웍스 채널 또는 Jira 티켓',
    },
    requestButton: '담당자에게 권한 요청',
    retry: '다른 계정으로 다시 로그인',
  },
} as const
