import { useRef } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { texts } from '../../texts'
import { Card } from './Card'

export type Option = { id: string; title: string; subtitle?: string; trailing?: string }

type Props = {
  options: Option[]
  selectedId: string | null
  onSelect: (id: string) => void
  emptyMessage?: ReactNode
  label: string
}

/** 단일 선택 리스트 (listbox). 위/아래/Home/End로 이동하고 Enter/Space로 선택한다. */
export function OptionList({ options, selectedId, onSelect, emptyMessage, label }: Props) {
  const refs = useRef<(HTMLLIElement | null)[]>([])

  if (options.length === 0) {
    return (
      <Card className="p-1">
        <p className="m-0 px-4 py-[18px] text-center text-[13px] text-ink-4">{emptyMessage ?? texts.common.state.noResult}</p>
      </Card>
    )
  }

  // 선택 항목이 목록에 없으면 첫 항목이 탭 진입점이 된다
  const selectedIndex = options.findIndex((o) => o.id === selectedId)
  const tabIndex = selectedIndex >= 0 ? selectedIndex : 0

  const move = (index: number) => {
    const next = (index + options.length) % options.length
    refs.current[next]?.focus()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLLIElement>, index: number, id: string) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        return move(index + 1)
      case 'ArrowUp':
        e.preventDefault()
        return move(index - 1)
      case 'Home':
        e.preventDefault()
        return move(0)
      case 'End':
        e.preventDefault()
        return move(options.length - 1)
      case 'Enter':
      case ' ':
        e.preventDefault()
        return onSelect(id)
    }
  }

  return (
    <Card className="p-1">
      <ul role="listbox" aria-label={label} className="m-0 list-none p-0">
        {options.map((o, i) => {
          const selected = o.id === selectedId
          return (
            <li
              key={o.id}
              ref={(el) => {
                refs.current[i] = el
              }}
              role="option"
              aria-selected={selected}
              tabIndex={i === tabIndex ? 0 : -1}
              onClick={() => onSelect(o.id)}
              onKeyDown={(e) => onKeyDown(e, i, o.id)}
              className={cn(
                'flex w-full cursor-pointer items-center gap-3 rounded-ctl px-2.5 py-2 text-left',
                selected ? 'bg-primary text-white' : 'hover:bg-hover',
              )}
            >
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-[13px] font-medium" title={o.title}>
                  {o.title}
                </span>
                {o.subtitle && (
                  <span className={cn('truncate text-xs', selected ? 'text-white/80' : 'text-ink-4')} title={o.subtitle}>
                    {o.subtitle}
                  </span>
                )}
              </span>
              {o.trailing && <span className={cn('shrink-0 whitespace-nowrap text-xs', selected ? 'text-white/80' : 'text-ink-4')}>{o.trailing}</span>}
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
