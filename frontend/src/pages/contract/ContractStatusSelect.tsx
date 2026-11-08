import { useMemo } from 'react'
import { GroupedSelect } from '../../components/ui/GroupedSelect'
import { useEnumSet } from '../../hooks/useEnumSet'
import { CONTRACT_STATUS_SET } from '../../lib/enums'
import type { EnumValue } from '../../lib/enums'
import { texts } from '../../texts'

const t = texts.contract.statusSelect

type Props = {
  id?: string
  /** 상태 코드 (예: "100") */
  value: string
  onChange: (value: EnumValue | undefined) => void
}

/** 계약 상태를 분류(초안 · 검토 · 서명 …)별로 묶어 고르는 드롭다운. 선택지는 관리자 페이지의 enum 표에서 온다 */
export function ContractStatusSelect({ id, value, onChange }: Props) {
  const { data, loading, error } = useEnumSet(CONTRACT_STATUS_SET)

  const options = useMemo(
    () =>
      (data?.values ?? [])
        .filter((v) => v.active || v.code === value)
        .map((v) => ({ value: v.code, label: v.label, groupCode: v.groupCode, hint: v.code })),
    [data, value],
  )

  if (error) return <span role="alert" className="text-[13px] text-danger-ink">{t.loadFailed}</span>

  return (
    <GroupedSelect
      id={id}
      value={value}
      groups={(data?.groups ?? []).map((g) => ({ code: g.code, name: g.name }))}
      options={options}
      disabled={loading}
      placeholder={loading ? t.loading : t.placeholder}
      groupTitle={t.groupTitle}
      optionTitle={t.optionTitle}
      otherLabel={t.other}
      onChange={(code) => onChange(data?.values.find((v) => v.code === code))}
    />
  )
}
