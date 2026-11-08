import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { ChevronDownIcon } from '../icons'
import { cn } from '../../lib/cn'

export type GroupedOption = { value: string; label: string; groupCode: string | null; hint?: string }
export type GroupedGroup = { code: string; name: string }

type Props = {
  id?: string
  value: string
  groups: GroupedGroup[]
  options: GroupedOption[]
  onChange: (value: string) => void
  placeholder?: string
  /** 분류가 없는 값을 모아 보여 줄 때의 이름 */
  otherLabel?: string
  groupTitle?: string
  optionTitle?: string
  disabled?: boolean
}

const OTHER = '__other__'

/**
 * 값이 많은 선택지를 분류별로 묶어 고르는 드롭다운.
 * 왼쪽에서 분류를 고르면 오른쪽에 그 분류의 값이 나온다.
 */
export function GroupedSelect({ id, value, groups, options, onChange, placeholder = '선택', otherLabel = '기타', groupTitle = '분류', optionTitle = '단계', disabled }: Props) {
  const autoId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [picked, setPicked] = useState<string | null>(null)

  const columns = useMemo(() => {
    const known = new Set(groups.map((g) => g.code))
    const list = groups.map((g) => ({ code: g.code, name: g.name, items: options.filter((o) => o.groupCode === g.code) }))
    const others = options.filter((o) => !o.groupCode || !known.has(o.groupCode))
    if (others.length > 0) list.push({ code: OTHER, name: otherLabel, items: others })
    return list.filter((c) => c.items.length > 0)
  }, [groups, options, otherLabel])

  const current = options.find((o) => o.value === value)
  const currentGroup = columns.find((c) => c.items.some((o) => o.value === value))
  const activeCode = picked ?? currentGroup?.code ?? columns[0]?.code
  const active = columns.find((c) => c.code === activeCode)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const toggle = () => {
    if (disabled) return
    setPicked(null)
    setOpen((v) => !v)
  }

  const panelId = `${id ?? autoId}-panel`

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={toggle}
        className="flex h-[38px] w-full items-center justify-between gap-2 rounded-ctl border border-line-strong bg-surface px-3 text-left text-[13.5px] hover:bg-hover disabled:cursor-not-allowed disabled:bg-fill"
      >
        <span className={cn('min-w-0 truncate', !current && 'text-ink-4')}>
          {current ? (
            <>
              {currentGroup && <span className="text-ink-4">{currentGroup.name} › </span>}
              {current.label}
            </>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDownIcon size={14} className={cn('shrink-0 text-ink-3 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div id={panelId} className="absolute left-0 top-full z-30 mt-1 grid w-[min(560px,92vw)] grid-cols-[190px_1fr] overflow-hidden rounded-xl border border-line-strong bg-surface shadow-lg">
          <ul role="listbox" aria-label={groupTitle} className="m-0 max-h-[320px] list-none overflow-y-auto border-r border-line-soft bg-[#f6f6f8] p-1.5">
            {columns.map((c) => {
              const selected = c.code === activeCode
              return (
                <li key={c.code} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => setPicked(c.code)}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[13px]',
                      selected ? 'bg-surface font-semibold text-ink shadow-seg' : 'text-ink-2 hover:bg-hover',
                    )}
                  >
                    <span className="truncate">{c.name}</span>
                    <span className="shrink-0 text-[11.5px] tabular-nums text-ink-4">{c.items.length}</span>
                  </button>
                </li>
              )
            })}
          </ul>
          <ul role="listbox" aria-label={optionTitle} className="m-0 max-h-[320px] list-none overflow-y-auto p-1.5">
            {active?.items.map((o) => {
              const selected = o.value === value
              return (
                <li key={o.value} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(o.value)
                      setOpen(false)
                    }}
                    className={cn('flex w-full flex-col rounded-lg px-2.5 py-2 text-left hover:bg-hover', selected && 'bg-fill font-semibold')}
                  >
                    <span className="text-[13px] text-ink">{o.label}</span>
                    {o.hint && <span className="text-[11.5px] tabular-nums text-ink-4">{o.hint}</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
