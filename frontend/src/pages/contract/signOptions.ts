/** 서명 방식·종류는 여러 개를 고를 수 있다. 값은 ', ' 로 이어 붙인 글자로 들고 있고, 없으면 '-' */
export const SIGN_NONE = '-'

export const toSignList = (v: string): string[] => (v === SIGN_NONE || v === '' ? [] : v.split(', '))

export const fromSignList = (list: string[]): string => (list.length > 0 ? list.join(', ') : SIGN_NONE)

/** 선택지에 없는 현재 값도 칩으로 보이게 해서 값이 사라지지 않게 한다 */
export const withCurrent = (options: string[], current: string[]): string[] => [...options, ...current.filter((c) => !options.includes(c))]
