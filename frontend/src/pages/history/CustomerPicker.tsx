import { useEffect, useRef, useState } from 'react'
import { BuildingIcon, ChevronDownIcon, SearchIcon } from '../../components/icons'
import { cn } from '../../lib/cn'
import { HISTORY_CUSTOMERS, MOCK_HISTORY_RECORDS } from '../../mocks/history'
import { texts } from '../../texts'

const t = texts.history

const defaultCount = (id: string) => MOCK_HISTORY_RECORDS.filter((r) => r.customerId === id).length

type PickerProps = {
  /** 선택된 고객사 ID. 빈 문자열이면 전체 */
  value: string
  onPick: (id: string) => void
  /** 고객사 옆에 보여 줄 건수. 없으면 처리 내역 건수를 보여 준다 */
  countOf?: (customerId: string) => number
}

/** 고객사 선택 목록 (고객사를 고르지 않은 화면의 검색 조건에서 쓴다) */
export function CustomerPicker({ value, onPick, countOf }: PickerProps) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  // 목록 바깥을 누르거나 Esc를 누르면 닫는다
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const picked = HISTORY_CUSTOMERS.find((c) => c.id === value)
  const query = q.trim().toLowerCase()
  const options = HISTORY_CUSTOMERS.filter((c) => !query || c.name.toLowerCase().includes(query) || c.code.includes(query))
  const choose = (id: string) => {
    onPick(id)
    setOpen(false)
    setQ('')
  }
  const optionCls = (on: boolean) => cn('flex w-full items-center justify-between gap-2 rounded-lg border-0 px-2.5 py-[7px] text-left text-[13px] hover:bg-hover', on ? 'bg-[#f2f2f5]' : 'bg-transparent')

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v)
          setQ('')
        }}
        className={cn(
          'flex h-[38px] w-full items-center gap-2 rounded-ctl border px-3 text-[13px] focus:outline-none',
          open ? 'border-primary shadow-[0_0_0_3px_rgb(35_100_170/0.22)]' : picked ? 'border-primary bg-[#f2f2f5] font-semibold text-ink' : 'border-line-strong bg-surface text-ink-2',
        )}
      >
        <BuildingIcon size={14} className="shrink-0 text-ink-4" />
        <span className="min-w-0 flex-1 truncate text-left">{picked ? picked.name : t.search.customerAll}</span>
        <ChevronDownIcon size={13} className="shrink-0 text-ink-4" />
      </button>
      {open && (
        <div role="listbox" aria-label={t.search.customerListLabel} className="absolute left-0 top-[42px] z-10 flex w-[320px] max-w-[90vw] flex-col gap-1 rounded-xl bg-surface p-2 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.22),0_0_0_0.5px_rgba(0,0,0,0.1)]">
          <label className="relative block">
            <span className="pointer-events-none absolute left-2.5 top-[9px] inline-flex text-ink-4">
              <SearchIcon size={14} strokeWidth={2.2} />
            </span>
            <input
              type="text"
              autoComplete="off"
              autoFocus
              aria-label={t.search.customerSearchLabel}
              placeholder={t.search.customerSearchPlaceholder}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-[34px] w-full rounded-ctl bg-fill pl-8 pr-3 text-[13px] text-ink placeholder:text-ink-4 focus:shadow-[0_0_0_3px_rgb(35_100_170/0.22)] focus:outline-none"
            />
          </label>
          <button type="button" role="option" aria-selected={value === ''} onClick={() => choose('')} className={cn(optionCls(value === ''), 'border border-line-soft')}>
            <span className="flex flex-col gap-px leading-tight">
              <span className="font-semibold">{t.search.customerAllTitle}</span>
              <span className="text-[11px] text-ink-4">{t.search.customerAllDescription}</span>
            </span>
          </button>
          <div className="flex max-h-[220px] flex-col gap-px overflow-y-auto">
            {options.map((c) => (
              <button key={c.id} type="button" role="option" aria-selected={value === c.id} onClick={() => choose(c.id)} className={optionCls(value === c.id)}>
                <span className="flex flex-col gap-px leading-tight">
                  <span className="font-medium">{c.name}</span>
                  <span className="font-mono text-[11px] text-ink-4">{c.code}</span>
                </span>
                <span className="text-xs tabular-nums text-ink-4">{t.search.customerCount((countOf ?? defaultCount)(c.id))}</span>
              </button>
            ))}
            {options.length === 0 && <span className="px-2.5 py-3 text-center text-xs text-ink-4">{t.search.customerEmpty}</span>}
          </div>
        </div>
      )}
    </div>
  )
}
