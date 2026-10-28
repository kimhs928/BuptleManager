/** 코멘트 · 히스토리 본문이 길어서 원문을 팝업으로 보여 줄지 판단하는 기준 */
export const LONG_TEXT = 80

/** 글자 수가 많거나 줄바꿈이 있으면 길다고 본다 */
export const isLong = (text: string) => text.length > LONG_TEXT || text.includes('\n')
