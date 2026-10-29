/** 연동 실행 결과 */
export type SyncStatus = 'SUCCEEDED' | 'FAILED'

export type SyncRun = {
  id: string
  /** YYYY-MM-DD HH:mm */
  at: string
  trigger: 'manual' | 'auto'
  operator: string
  status: SyncStatus
  scanned: number
  created: number
  updated: number
  unchanged: number
  failed: number
}

/** Buptle Biz 고객사 연동 이력 (최신순) */
export const MOCK_BIZ_SYNC_RUNS: SyncRun[] = [
  { id: 's3', at: '2024-05-23 08:30', trigger: 'auto', operator: '시스템', status: 'SUCCEEDED', scanned: 128, created: 0, updated: 3, unchanged: 125, failed: 0 },
  { id: 's2', at: '2024-05-22 08:30', trigger: 'auto', operator: '시스템', status: 'SUCCEEDED', scanned: 128, created: 1, updated: 0, unchanged: 127, failed: 0 },
  { id: 's1', at: '2024-05-21 15:12', trigger: 'manual', operator: '홍길동', status: 'FAILED', scanned: 0, created: 0, updated: 0, unchanged: 0, failed: 0 },
]

/** 수동 연동 응답 대기 시간 */
export const MOCK_SYNC_DELAY_MS = 1600

/** 수동 연동을 눌렀을 때의 목 결과 */
export const MOCK_SYNC_RESULT = { scanned: 130, created: 2, updated: 4, unchanged: 124, failed: 0 } as const
