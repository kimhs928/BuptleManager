/** 사이드바에서 올린 로고를 브라우저에 저장하는 키 */
export const LOGO_KEY = 'bm-logo'

/** 저장된 로고(데이터 URL). 없거나 읽을 수 없으면 빈 문자열 */
export function readLogo(): string {
  try {
    return localStorage.getItem(LOGO_KEY) ?? ''
  } catch {
    return ''
  }
}

/** 로고를 저장한다. 저장 공간이 없어도 현재 화면에는 반영된다 */
export function saveLogo(src: string): void {
  try {
    localStorage.setItem(LOGO_KEY, src)
  } catch {
    // 저장할 수 없는 환경에서는 현재 화면에서만 유지한다
  }
}
