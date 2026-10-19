/** 'YYYY-MM-DDTHH:mm' → 'YYYY-MM-DD HH:mm' (값이 없으면 대시) */
export function showDateTime(v: string): string {
  return v ? v.replace('T', ' ') : '-'
}

/** 표 머리글·셀 공통 스타일 */
export const tableTh = 'whitespace-nowrap px-3 py-2.5 text-left text-xs font-medium text-ink-4'
export const tableTd = 'px-3 py-3 align-top text-[13.5px]'

/** 변경 전/후 비교용 값 문자열 */
export function joinList(list: readonly string[], none: string): string {
  return list.length > 0 ? list.join(', ') : none
}

/** 삭제된 표 행: 옅은 배경과 왼쪽 빨간 띠 */
export const deletedRow = 'bg-[#fafafb] shadow-[inset_3px_0_0_var(--color-danger)]'

/** 삭제된 이름: 회색 글자에 빨간 취소선 */
export const deletedName = 'text-ink-4 line-through decoration-danger decoration-[1.5px]'
