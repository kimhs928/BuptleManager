import { useEffect, useState } from 'react'
import { enumApi } from '../lib/enums'
import type { EnumSetDetail } from '../lib/enums'

/** enum 표는 거의 바뀌지 않아 한 번 가져온 것을 화면 전체가 같이 쓴다 (표 목록마다 다시 요청하지 않는다) */
const cache = new Map<string, Promise<EnumSetDetail>>()

function load(set: string): Promise<EnumSetDetail> {
  let p = cache.get(set)
  if (!p) {
    p = enumApi.detail(set).catch((e: unknown) => {
      cache.delete(set)
      throw e
    })
    cache.set(set, p)
  }
  return p
}

export type EnumOption = { code: string; label: string }

/**
 * enum 표(DB)의 값 이름. options 는 사용 중인 값을 순서대로, label(code) 는 코드의 표시 이름이다.
 * group(code) 는 값의 분류 코드. 아직 불러오는 중이거나 표에 없는 코드는 코드 그대로 보여 준다.
 */
export function useEnumLabels(set: string) {
  const [data, setData] = useState<{ set: string; detail: EnumSetDetail } | null>(null)

  useEffect(() => {
    let alive = true
    load(set)
      .then((detail) => alive && setData({ set, detail }))
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [set])

  const detail = data?.set === set ? data.detail : null
  const all = detail?.values ?? []
  const names = new Map(all.map((v) => [v.code, v.label]))
  const options: EnumOption[] = all.filter((v) => v.active).map((v) => ({ code: v.code, label: v.label }))
  const groups = new Map(all.map((v) => [v.code, v.groupCode ?? '']))
  return { options, label: (code: string) => names.get(code) ?? code, group: (code: string) => groups.get(code) ?? '', loading: detail === null }
}
