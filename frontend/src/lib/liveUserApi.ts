/** Biz 실시간 접속 유저 API (/api/biz/companies/{schema}/live-users). 서버 응답과 같은 모양 */
export type LiveUserApi = {
  id: string
  name: string
  email: string
  employeeNo: string
  ip: string
  sessionId: string
  lastActiveAt: string
  loginAt: string
}

export type LiveUsersApi = { refreshedAt: string; items: LiveUserApi[]; total: number }

import { sendJson } from './apiWrite'
import type { Audit } from './apiWrite'

export type ForceLogoutApi = { loggedOut: { id: string; name: string }[]; historyIds: number[] }

export const liveUserApi = {
  /** 선택한 세션을 끊는다 (Biz login_info.active = false) */
  forceLogout: (schema: string, sessionIds: string[], audit: Audit) =>
    sendJson<ForceLogoutApi>('POST', `/api/biz/companies/${encodeURIComponent(schema)}/live-users/force-logout`, { sessionIds, audit }),
  list: async (schema: string, signal?: AbortSignal): Promise<LiveUsersApi> => {
    const res = await fetch(`/api/biz/companies/${encodeURIComponent(schema)}/live-users`, { signal })
    if (!res.ok) throw new Error(String(res.status))
    return res.json() as Promise<LiveUsersApi>
  },
}
