import { COMPARE_HIDDEN_ACTIONS } from '../../mocks/contract'
import type { HistoryRow } from '../../mocks/contract'

/** 이 이력이 문서 버전과 연결되어 이력 보기 · 다운로드 버튼이 필요한지 판단한다 */
export function docButtonState(row: HistoryRow): 'none' | 'hidden' | 'disabled' | 'enabled' {
  const { htmlType, compareDoc, docId } = row.extra
  // html_type이 3 · 6이 아니어도 compare_doc이 true면 문서 버전으로 본다
  const isVersion = htmlType === 3 || htmlType === 6 || compareDoc
  if (!isVersion) return 'none'
  if (COMPARE_HIDDEN_ACTIONS.includes(row.action)) return 'hidden'
  return docId ? 'enabled' : 'disabled'
}
