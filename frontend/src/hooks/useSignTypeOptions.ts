import { useEnumSet } from './useEnumSet'

/** 화면에서 고를 수 있는 서명 종류 표 (enum) */
export const SIGN_TYPE_SET = 'BIZ_SIGN_TYPE_SELECTABLE'

/** 선택 가능한 서명 종류 이름. 아직 불러오는 중이거나 실패하면 빈 목록 */
export function useSignTypeOptions(): string[] {
  const { data } = useEnumSet(SIGN_TYPE_SET)
  return data?.values.filter((v) => v.active).map((v) => v.label) ?? []
}
