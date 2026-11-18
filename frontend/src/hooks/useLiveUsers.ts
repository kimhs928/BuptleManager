import { useCallback, useEffect, useState } from 'react'
import { liveUserApi } from '../lib/liveUserApi'
import type { LiveUserApi } from '../lib/liveUserApi'
import { formatDateTime } from '../lib/date'
import type { ServicePlatform } from '../lib/platform'
import type { LiveUser } from '../mocks/companyDetail'

/** 최근 활동으로 보는 시간(분). 이 안이면 초록 점 */
const RECENT_MINUTES = 5

function relative(iso: string, now: number): string {
  const min = Math.floor((now - new Date(iso).getTime()) / 60000)
  if (min < 1) return '방금 전'
  if (min < 60) return `${min}분 전`
  const hour = Math.floor(min / 60)
  return hour < 24 ? `${hour}시간 전` : `${Math.floor(hour / 24)}일 전`
}

/** 세션 ID 는 앞뒤 4글자만 보여 준다 */
const maskSession = (id: string) => (id.length > 10 ? `${id.slice(0, 4)}…${id.slice(-4)}` : id)

function toLiveUser(u: LiveUserApi, now: number): LiveUser {
  const minutes = (now - new Date(u.lastActiveAt).getTime()) / 60000
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    employeeNo: u.employeeNo || '-',
    ip: u.ip || '-',
    session: maskSession(u.sessionId),
    sessionId: u.sessionId,
    lastActive: relative(u.lastActiveAt, now),
    recent: minutes < RECENT_MINUTES,
    loginAt: u.loginAt ? formatDateTime(new Date(u.loginAt)) : '-',
  }
}

type State = { key: string; users: LiveUser[]; error: boolean }

/** 고객사의 실시간 접속 유저. Biz 고객사만 서버에서 가져오고, 그 외에는 빈 목록이다 */
export function useLiveUsers(platform: ServicePlatform, schema: string) {
  const [state, setState] = useState<State>({ key: '', users: [], error: false })
  const [tick, setTick] = useState(0)
  const enabled = platform === 'BUPTLE_BIZ'
  const key = `${platform}|${schema}|${tick}`

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    liveUserApi
      .list(schema, controller.signal)
      .then((data) => {
        const now = Date.now()
        setState({ key, users: data.items.map((u) => toLiveUser(u, now)), error: false })
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setState({ key, users: [], error: true })
      })
    return () => controller.abort()
  }, [enabled, schema, key])

  const reload = useCallback(() => setTick((n) => n + 1), [])
  const ready = !enabled || state.key === key
  return { users: ready ? state.users : [], loading: !ready, error: ready && state.error, reload }
}
