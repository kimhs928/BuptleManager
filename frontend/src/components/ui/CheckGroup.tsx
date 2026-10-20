import type { ReactNode } from 'react'
import { Chip } from './Chip'

/** 복수 선택 칩 묶음 */
export function CheckGroup({ options, value, onChange, label }: { options: readonly string[]; value: readonly string[]; onChange: (next: string[], toggled: string) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <Chip
          key={o}
          label={o}
          checked={value.includes(o)}
          onChange={() => onChange(value.includes(o) ? value.filter((v) => v !== o) : [...value, o], o)}
        />
      ))}
    </div>
  )
}

/** 라벨 + 복수 선택 칩 */
export function GroupField({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="col-span-2 flex flex-col gap-1.5">
      <span className="inline-flex items-center gap-2 text-xs font-medium text-ink-2">
        {label}
        {required && <span className="text-danger-ink">*</span>}
        {hint && <span className="text-[11px] font-normal text-ink-4">{hint}</span>}
      </span>
      {children}
    </div>
  )
}
