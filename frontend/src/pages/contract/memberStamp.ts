import { formatDateTime } from '../../lib/date'

/** 수정 시각과 삭제 시각을 갱신한다. 삭제를 풀면 삭제일을 비운다 */
export function stamp(member: { deleted: boolean; deletedAt: string }, deleted: boolean) {
  const now = formatDateTime()
  return { updatedAt: now, deletedAt: deleted ? (member.deleted ? member.deletedAt : now) : '' }
}
