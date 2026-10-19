import type { ReactNode } from 'react'
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

/** 단일 선택 리스트 */
export function OptionList({ options, selectedId, onSelect, emptyMessage, label }: Props) {
  return (
    <Card className="p-1">
      <ul role="listbox" aria-label={label} className="m-0 list-none p-0">
        {options.map((o) => {
          const selected = o.id === selectedId
          return (
            <li key={o.id}>
              <button
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => onSelect(o.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-ctl px-2.5 py-2 text-left',
                  selected ? 'bg-primary text-white' : 'hover:bg-hover',
                )}
              >
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[13px] font-medium">{o.title}</span>
                  {o.subtitle && (
                    <span className={cn('whitespace-nowrap text-xs', selected ? 'text-white/80' : 'text-ink-4')}>{o.subtitle}</span>
                  )}
                </span>
                {o.trailing && (
                  <span className={cn('whitespace-nowrap text-xs', selected ? 'text-white/80' : 'text-ink-4')}>{o.trailing}</span>
                )}
              </button>
            </li>
          )
        })}
        {options.length === 0 && (
          <li className="px-4 py-[18px] text-center text-[13px] text-ink-4">{emptyMessage ?? texts.common.state.noResult}</li>
        )}
      </ul>
    </Card>
  )
}
