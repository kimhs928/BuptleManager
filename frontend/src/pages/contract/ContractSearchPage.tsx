import { useState } from 'react'
import { ChevronRightIcon, CloseIcon, InfoIcon, SearchIcon, TrashIcon } from '../../components/icons'
import { CompanyShell } from '../../components/layout/CompanyShell'
import { Button, Card, Lines } from '../../components/ui'
import { cn } from '../../lib/cn'
import { MOCK_COMPANY_DETAIL } from '../../mocks/companyDetail'
import { MOCK_CONTRACTS } from '../../mocks/contract'
import { texts } from '../../texts'
import { deletedName, deletedRow, tableTd, tableTh } from './format'
import { DeletedBadge, StatusDot } from './shared'

const t = texts.contract.search

type Props = {
  /** 처음 채워 둘 검색어 */
  initialQuery?: string
}

/** 계약 검색 */
export function ContractSearchPage({ initialQuery = '' }: Props) {
  const [query, setQuery] = useState(initialQuery)
  const [includeDeleted, setIncludeDeleted] = useState(true)

  const q = query.trim().toLowerCase()
  const qPlain = q.replace(/-/g, '')
  const results = MOCK_CONTRACTS.filter((c) => includeDeleted || !c.deleted).filter((c) =>
    q ? c.id.toLowerCase().replace(/-/g, '').includes(qPlain) || c.name.toLowerCase().includes(q) : c.recent,
  )

  return (
    <CompanyShell active="contract" trail={[{ label: texts.contract.breadcrumb.features }, { label: texts.contract.breadcrumb.contract }]}>
      <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-[22px]">
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="m-0 text-[26px] font-bold tracking-[-0.02em]">{t.title}</h1>
            <p className="m-0 text-sm text-ink-3">{t.description(MOCK_COMPANY_DETAIL.name)}</p>
          </div>

          <form role="search" className="flex gap-2.5" onSubmit={(e) => e.preventDefault()}>
            <label className="relative block flex-1">
              <span className="pointer-events-none absolute left-[13px] top-[11px] inline-flex text-ink-4">
                <SearchIcon size={16} strokeWidth={2.2} />
              </span>
              <input
                type="text"
                autoComplete="off"
                aria-label={t.label}
                placeholder={t.placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-[38px] w-full rounded-[10px] border-0 bg-surface px-[38px] text-sm text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] placeholder:text-ink-4 focus:outline-none focus:shadow-[0_0_0_3px_rgb(35_100_170/0.22)]"
              />
              {query && (
                <button type="button" aria-label={t.clear} onClick={() => setQuery('')} className="absolute right-[9px] top-2.5 inline-flex size-[18px] items-center justify-center rounded-full bg-ink-5 p-0 text-white">
                  <CloseIcon size={9} strokeWidth={3} />
                </button>
              )}
            </label>
            <Button type="submit" variant="dark" icon={<SearchIcon size={14} strokeWidth={2.4} />} className="h-[38px] rounded-[10px] px-[18px] text-[13.5px] font-semibold">
              {t.submit}
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-3.5 text-[12.5px] text-ink-4">
            <span className="inline-flex items-center gap-1.5">
              <InfoIcon size={13} />
              {t.hint}
            </span>
            <span aria-hidden="true" className="h-3 w-px bg-line-strong" />
            <label className="inline-flex cursor-pointer select-none items-center gap-1.5 text-ink">
              <input type="checkbox" checked={includeDeleted} onChange={(e) => setIncludeDeleted(e.target.checked)} className="m-0 size-[15px] accent-primary" />
              {t.includeDeleted}
            </label>
          </div>
        </section>

        <section aria-label={q ? t.resultTitle : t.recentTitle}>
          <Card className="overflow-hidden">
            <div className="flex items-baseline gap-2 border-b border-line-soft px-5 py-4">
              <span className="text-[15px] font-semibold">{q ? t.resultTitle : t.recentTitle}</span>
              <span className="text-[13px] text-ink-4" aria-live="polite">
                {t.count(results.length, includeDeleted)}
              </span>
            </div>

            {results.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] border-collapse text-[13.5px]">
                  <thead>
                    <tr>
                      <th scope="col" className={cn(tableTh, 'w-[110px] pl-5')}>{t.columns.id}</th>
                      <th scope="col" className={tableTh}>{t.columns.name}</th>
                      <th scope="col" className={tableTh}>{t.columns.status}</th>
                      <th scope="col" className={tableTh}>{t.columns.kind}</th>
                      <th scope="col" className={tableTh}>{t.columns.drafter}</th>
                      <th scope="col" className={cn(tableTh, 'text-right')}>{t.columns.members}</th>
                      <th scope="col" className={cn(tableTh, 'pr-5')}>
                        <span className="sr-only">{t.detail}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((c) => (
                      <tr key={c.id} className={cn('border-t border-line-soft', c.deleted ? deletedRow : 'bg-surface hover:bg-hover')}>
                        <td className={cn(tableTd, 'whitespace-nowrap pl-5 font-mono text-[12.5px]', c.deleted ? 'text-ink-5' : 'text-ink-2')}>{c.id}</td>
                        <td className={cn(tableTd, 'min-w-[240px]')}>
                          <span className="flex flex-col gap-0.5">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className={cn('font-medium', c.deleted ? deletedName : 'text-ink')}>{c.name}</span>
                              {c.deleted && <DeletedBadge label={t.deleted} />}
                            </span>
                            <span className="text-xs tabular-nums text-ink-4">{t.created(c.createdAt)}</span>
                            {c.deleted && c.deletedAt && c.deletedBy && (
                              <span className="inline-flex items-center gap-[5px] text-xs tabular-nums text-danger-ink">
                                <TrashIcon size={11} strokeWidth={2.2} />
                                {t.deletedInfo(c.deletedAt, c.deletedBy)}
                              </span>
                            )}
                          </span>
                        </td>
                        <td className={cn(tableTd, 'whitespace-nowrap')}>
                          <StatusDot status={c.status} muted={c.deleted} className="gap-[7px] text-ink" />
                        </td>
                        <td className={cn(tableTd, 'whitespace-nowrap tabular-nums', c.deleted ? 'text-ink-5' : 'text-ink-3')}>{c.kind}</td>
                        <td className={cn(tableTd, 'whitespace-nowrap tabular-nums', c.deleted ? 'text-ink-5' : 'text-ink-3')}>{c.drafter}</td>
                        <td className={cn(tableTd, 'whitespace-nowrap text-right tabular-nums', c.deleted ? 'text-ink-5' : 'text-ink-2')}>{t.members(c.members)}</td>
                        <td className={cn(tableTd, 'whitespace-nowrap pr-5 text-right')}>
                          <a href={`?contract=${c.id}`} className="inline-flex h-7 items-center gap-1 rounded-ctl border border-line-strong bg-surface px-2.5 text-[12.5px] font-medium text-ink hover:bg-hover">
                            {t.detail}
                            <ChevronRightIcon size={11} />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 px-6 py-14 text-center">
                <p className="m-0 text-[15px] font-semibold text-ink-2">{t.emptyTitle}</p>
                <p className="m-0 text-[13px] leading-relaxed text-ink-4">
                  <Lines lines={t.emptyDescription(query.trim())} />
                </p>
              </div>
            )}
          </Card>
        </section>
      </div>
    </CompanyShell>
  )
}
