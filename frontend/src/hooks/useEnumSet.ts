import { useCallback, useEffect, useState } from 'react'
import { enumApi } from '../lib/enums'
import type { EnumSetDetail } from '../lib/enums'

type State = { key: string; data: EnumSetDetail | null; error: boolean }

/** enum 표 하나를 서버에서 가져온다. set 이 null 이면 요청하지 않는다 */
export function useEnumSet(set: string | null) {
  const [state, setState] = useState<State>({ key: '', data: null, error: false })
  const [tick, setTick] = useState(0)
  const key = set ? `${set}|${tick}` : ''

  useEffect(() => {
    if (!set) return
    const controller = new AbortController()
    enumApi
      .detail(set, controller.signal)
      .then((data) => setState({ key, data, error: false }))
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setState({ key, data: null, error: true })
      })
    return () => controller.abort()
  }, [set, key])

  const reload = useCallback(() => setTick((n) => n + 1), [])
  const ready = set === null || state.key === key
  return { data: ready ? state.data : null, loading: !ready, error: ready && state.error, reload }
}
