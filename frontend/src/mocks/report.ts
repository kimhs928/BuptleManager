// TODO: 백엔드 연동 시 제거

export type ReportKind = 'contract' | 'counsel'

export type ReportStatus = '해결' | '확인중' | '미해결'

export type ErrorReport = {
  id: string
  docId: string
  kind: string
  message: string
  /** YYYY-MM-DD HH:mm */
  at: string
  status: ReportStatus
}

/** 화면의 "오늘" 기준일. 빠른 선택(최근 7일 등)의 기준이 된다 */
export const MOCK_REPORT_TODAY = '2024-05-23'

export const MOCK_ERROR_REPORTS: Record<ReportKind, ErrorReport[]> = {
  contract: [
    { id: 'ER-C-0428', docId: 'CT-2024-0120', kind: '문서 업로드 실패', message: '원본 파일 용량 초과(52MB)로 업로드가 중단되었습니다.', at: '2024-04-28 14:02', status: '해결' },
    { id: 'ER-C-0502', docId: 'CT-2024-0315', kind: '서명 요청 발송 실패', message: '수신자 이메일 서버 응답 지연으로 서명 요청 메일이 발송되지 않았습니다.', at: '2024-05-02 10:14', status: '해결' },
    { id: 'ER-C-0507', docId: 'CT-2024-0402', kind: '참여자 이메일 반송', message: '상대방 이메일 주소가 존재하지 않아 반송되었습니다.', at: '2024-05-07 16:40', status: '해결' },
    { id: 'ER-C-0509', docId: 'CT-2024-0402', kind: '템플릿 변환 오류', message: '표 서식이 포함된 템플릿을 PDF로 변환하는 중 오류가 발생했습니다.', at: '2024-05-09 09:25', status: '확인중' },
    { id: 'ER-C-0513', docId: 'CT-2024-0518', kind: '워크플로우 단계 오류', message: '승인 단계 완료 후 다음 단계로 이동하지 않았습니다.', at: '2024-05-13 11:08', status: '미해결' },
    { id: 'ER-C-0516', docId: 'CT-2024-0207', kind: '문서 업로드 실패', message: '네트워크 오류로 첨부 파일 3건이 누락되었습니다.', at: '2024-05-16 15:33', status: '해결' },
    { id: 'ER-C-0520', docId: 'CT-2024-0315', kind: '서명 요청 발송 실패', message: '서명자 휴대전화 인증 번호가 발급되지 않았습니다.', at: '2024-05-20 13:51', status: '확인중' },
    { id: 'ER-C-0522', docId: 'CT-2024-0411', kind: '참여자 이메일 반송', message: '받는 사람 사서함 용량 초과로 반송되었습니다.', at: '2024-05-22 10:02', status: '미해결' },
  ],
  counsel: [
    { id: 'ER-N-0430', docId: 'CN-2024-0112', kind: '첨부 파일 오류', message: '답변 첨부 파일이 열리지 않는 형식(.hwpx)으로 저장되었습니다.', at: '2024-04-30 17:20', status: '해결' },
    { id: 'ER-N-0508', docId: 'CN-2024-0205', kind: '알림 발송 실패', message: '담당 변호사 배정 알림 메일이 발송되지 않았습니다.', at: '2024-05-08 09:48', status: '해결' },
    { id: 'ER-N-0514', docId: 'CN-2024-0205', kind: '상태 변경 오류', message: '검토중에서 답변완료로 상태가 바뀌지 않았습니다.', at: '2024-05-14 14:12', status: '미해결' },
    { id: 'ER-N-0517', docId: 'CN-2024-0318', kind: '코멘트 저장 오류', message: '긴 코멘트 저장 시 일부 문자가 잘려 저장되었습니다.', at: '2024-05-17 11:30', status: '확인중' },
    { id: 'ER-N-0521', docId: 'CN-2024-0318', kind: '알림 발송 실패', message: '요청자에게 답변 완료 알림이 발송되지 않았습니다.', at: '2024-05-21 16:05', status: '해결' },
  ],
}
