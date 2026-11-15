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

export const liveUserApi = {
  list: async (schema: string, signal?: AbortSignal): Promise<LiveUsersApi> => {
    const res = await fetch(`/api/biz/companies/${encodeURIComponent(schema)}/live-users`, { signal })
    if (!res.ok) throw new Error(String(res.status))
    return res.json() as Promise<LiveUsersApi>
  },
}
