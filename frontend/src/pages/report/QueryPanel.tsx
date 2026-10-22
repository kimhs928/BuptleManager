import { useState } from 'react'
import { ChevronDownIcon } from '../../components/icons'
import { Alert } from '../../components/ui'
import { cn } from '../../lib/cn'
import { texts } from '../../texts'

const t = texts.report.query

type Props = {
  query: string
  defaultQuery: string
  /** 쿼리에 들어갈 값. 아직 고르지 않았으면 value 가 빈 문자열 */
  params: { name: string; value: string }[]
  /** 쿼리를 실행할 수 없는 이유. 없으면 null */
  error: string | null
  onChange: (next: string) => void
}

/** 추출 쿼리 편집. 쿼리가 길어서 기본으로는 접어 둔다 */
export function QueryPanel({ query, defaultQuery, params, error, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const edited = query !== defaultQuery

  return (
    <section aria-label={t.title} className="flex flex-col gap-2">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-line-strong bg-surface px-4 py-3 text-left shadow-card hover:bg-hover"
      >
        <ChevronDownIcon size={16} strokeWidth={2.4} className={cn('shrink-0 text-ink-3 transition-transform', !open && '-rotate-90')} />
        <span className="text-[13px] font-semibold">{t.title}</span>
        {edited && <span className="rounded-full bg-[#fff8db] px-2 py-px text-[10.5px] font-semibold text-[#9a6b00]">{t.edited}</span>}
        <span className="min-w-0 flex-1 truncate text-xs text-ink-4">{t.hint}</span>
        <span className="shrink-0 text-xs font-medium text-ink-3">{open ? t.hide : t.show}</span>
      </button>

      {open && (
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface px-4 py-3.5 shadow-card">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-3">
            <span className="font-semibold">{t.params}</span>
            {params.map((p) => (
              <span key={p.name} className="inline-flex items-center gap-1.5">
                <code className="rounded-[5px] bg-[#ebebf0] px-1.5 py-px font-mono text-[11.5px] text-ink-2">:{p.name}</code>
                <span className={cn('tabular-nums', p.value ? 'text-ink' : 'text-ink-5')}>{p.value || t.unset}</span>
              </span>
            ))}
            <button
              type="button"
              disabled={!edited}
              onClick={() => onChange(defaultQuery)}
              className={cn('ml-auto h-7 rounded-[7px] border px-2.5 text-xs font-medium', edited ? 'cursor-pointer border-line-strong bg-surface text-ink hover:bg-hover' : 'cursor-not-allowed border-line-soft bg-[#f2f2f5] text-ink-5')}
            >
              {t.reset}
            </button>
          </div>
          <textarea
            aria-label={t.editLabel}
            aria-invalid={error ? true : undefined}
            value={query}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
            rows={14}
            className={cn(
              'w-full resize-y rounded-[10px] border bg-[#fafafb] px-3.5 py-3 font-mono text-[12.5px] leading-[1.6] text-ink outline-none focus:bg-surface',
              error ? 'border-danger' : 'border-line-strong focus:border-primary',
            )}
          />
          {error && <Alert tone="danger">{error}</Alert>}
        </div>
      )}
    </section>
  )
}
