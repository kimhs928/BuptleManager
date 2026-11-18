/** 수정·추가 API 호출 공통. 서버가 준 오류 문구를 그대로 올려 준다 */

/** 수정 팝업에서 받은 티켓 · 요청자 · 사유 (서버의 audit 와 같은 모양) */
export type Audit = { ticket: string; requester: string; reason: string }

function xsrfHeader(): Record<string, string> {
  const m = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/)
  return m ? { 'X-XSRF-TOKEN': decodeURIComponent(m[1]) } : {}
}

export async function sendJson<T>(method: 'PATCH' | 'POST', url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', ...xsrfHeader() }, body: JSON.stringify(body) })
  if (!res.ok) {
    const problem = (await res.json().catch(() => null)) as { detail?: string } | null
    throw new Error(problem?.detail ?? String(res.status))
  }
  return res.json() as Promise<T>
}

/** 바뀐 항목만 모은다. 값이 같으면 보내지 않는다 */
export function diffOf<T extends object>(before: T, after: T, keys: (keyof T)[]): Partial<T> {
  const out: Partial<T> = {}
  for (const k of keys) if (before[k] !== after[k]) out[k] = after[k]
  return out
}

/** 'YYYY-MM-DDTHH:mm'(브라우저 시간대) → ISO(UTC). 비어 있으면 undefined */
export function localToIso(local: string): string | undefined {
  return local ? new Date(local).toISOString() : undefined
}
