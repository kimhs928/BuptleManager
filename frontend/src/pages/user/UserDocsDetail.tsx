import { ChevronRightIcon } from '../../components/icons'
import { cn } from '../../lib/cn'
import { MOCK_DOC_TITLES, MOCK_JOINED } from '../../mocks/user'
import type { CompanyUser, DocKind } from '../../mocks/user'
import { texts } from '../../texts'

const t = texts.user.list
const KINDS: DocKind[] = ['contract', 'counsel', 'litigation']
const PER_PAGE = 10

/** 문서 상세 화면 주소. 계약 상세만 구현되어 있고, 자문 · 소송 상세는 화면이 생기면 연결된다 */
const docHref: Record<DocKind, (id: string) => string> = {
  contract: (id) => `?contract=${id}`,
  counsel: (id) => `?counsel=${id}`,
  litigation: (id) => `?litigation=${id}`,
}

type Props = {
  user: CompanyUser
  /** 선택된 분류. 빈 문자열이면 아무것도 열지 않은 상태 */
  selected: DocKind | ''
  page: number
  onSelect: (kind: DocKind | '') => void
  onPage: (page: number) => void
}

/** 유저가 참여 중인 계약 · 자문 · 소송 (행 펼침 영역) */
export function UserDocsDetail({ user, selected, page, onSelect, onPage }: Props) {
  const joined = MOCK_JOINED[user.id] ?? { contract: [], counsel: [], litigation: [] }
  const ids = selected ? joined[selected] : []
  const last = Math.max(1, Math.ceil(ids.length / PER_PAGE))
  const current = Math.min(Math.max(1, page), last)
  const items = ids.slice((current - 1) * PER_PAGE, current * PER_PAGE)
  const paged = ids.length > PER_PAGE

  const navBtn = 'inline-flex size-[26px] items-center justify-center rounded-md border border-line-strong bg-surface p-0'

  return (
    <div className="mx-5 mb-3.5 mt-2.5 flex flex-col gap-3 rounded-[10px] border border-line-strong border-l-[3px] border-l-primary bg-surface px-4 py-3.5 md:ml-[46px]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1.5 text-xs font-semibold">{t.joinedDocs(user.name)}</span>
        {KINDS.map((k) => {
          const count = joined[k].length
          const on = selected === k
          const off = count === 0
          return (
            <button
              key={k}
              type="button"
              disabled={off}
              aria-pressed={on}
              onClick={() => onSelect(on ? '' : k)}
              className={cn(
                'inline-flex h-[30px] items-center gap-2 rounded-ctl px-3 text-[12.5px]',
                on ? 'border-[1.5px] border-primary bg-[#f2f2f5] font-semibold shadow-[0_0_0_3px_rgba(35,100,170,0.12)]' : off ? 'cursor-default border border-dashed border-line-strong bg-[#fafafb] font-medium text-ink-5' : 'border border-[#aeaeb2] bg-surface font-medium shadow-[0_1px_1px_rgba(0,0,0,0.04)]',
              )}
            >
              <span>{t.docKinds[k]}</span>
              <span className={cn('font-bold tabular-nums', off ? 'text-[#c7c7cc]' : on ? 'text-primary' : 'text-ink')}>{t.docCount(count)}</span>
            </button>
          )
        })}
        {!selected && <span className="text-xs text-ink-4">{t.detailHint}</span>}
      </div>

      {selected && (
        <div className="overflow-hidden rounded-[10px] border border-line-strong bg-surface">
          <div className="flex items-center justify-between gap-3 border-b border-divider bg-[#fafafb] py-2 pl-3.5 pr-2.5">
            <span className="text-xs font-semibold">
              {t.docKinds[selected]} {t.docCount(ids.length)}{' '}
              {paged && <span className="font-normal text-ink-4">{t.docRange((current - 1) * PER_PAGE + 1, Math.min(current * PER_PAGE, ids.length))}</span>}
            </span>
            {paged && (
              <div className="flex items-center gap-1">
                <button type="button" aria-label={t.prevPage} disabled={current <= 1} onClick={() => onPage(current - 1)} className={cn(navBtn, 'disabled:cursor-default disabled:text-[#c7c7cc]')}>
                  <ChevronRightIcon size={11} className="rotate-180" />
                </button>
                {Array.from({ length: last }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-current={n === current ? 'page' : undefined}
                    onClick={() => onPage(n)}
                    className={cn('h-[26px] min-w-[26px] rounded-md border px-1.5 text-xs tabular-nums', n === current ? 'border-primary bg-primary font-semibold text-white' : 'border-line-strong bg-surface font-medium')}
                  >
                    {n}
                  </button>
                ))}
                <button type="button" aria-label={t.nextPage} disabled={current >= last} onClick={() => onPage(current + 1)} className={cn(navBtn, 'disabled:cursor-default disabled:text-[#c7c7cc]')}>
                  <ChevronRightIcon size={11} />
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-[150px_minmax(0,1fr)] gap-x-4 border-b border-line-soft px-3.5 py-2 text-[11.5px] font-medium text-ink-4">
            <span>{t.docIdHead[selected]}</span>
            <span>{t.docTitleHead}</span>
          </div>
          {items.map((id) => (
            <div key={id} className="grid grid-cols-[150px_minmax(0,1fr)] items-baseline gap-x-4 border-t border-bg px-3.5 py-2 text-[13px]">
              <a href={docHref[selected](id)} className="font-mono text-xs text-link hover:underline">
                {id}
              </a>
              <a href={docHref[selected](id)} className="truncate hover:underline">
                {MOCK_DOC_TITLES[selected][id] ?? ''}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
