import { useEffect, useState } from 'react'

/** 지정한 간격(기본 1초)마다 갱신되는 현재 시각 */
export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}
