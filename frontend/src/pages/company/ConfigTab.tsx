import { useState } from 'react'
import { ArrowRightIcon, SearchIcon } from '../../components/icons'
import { Button, Card, EmptyState, SearchInput } from '../../components/ui'
import { cn } from '../../lib/cn'
import { MOCK_CONFIG_SYNCED_AT, MOCK_CONFIGS, MOCK_PUBLIC_CONFIGS } from '../../mocks/companyDetail'
import type { ConfigRow, ConfigScope } from '../../mocks/companyDetail'
import { texts } from '../../texts'

const t = texts.company.config

type Filter = 'ALL' | 'PUBLIC' | ConfigScope

const scopes: ConfigScope[] = ['COMPONENT', 'MODULES', 'STANDALONE']

/** 값을 가지는 컨피그 타입. 새 타입에 값이 필요하면 여기에 추가한다 */
const scopeHasValue: Record<ConfigScope, boolean> = { COMPONENT: false, MODULES: false, STANDALONE: true }

const scopeTone: Record<ConfigScope, string> = {
  COMPONENT: 'bg-[#f0effd] text-[#4b49c8]',
  MODULES: 'bg-[#f2f2f5] text-ink',
  STANDALONE: 'bg-[#f2f2f5] text-ink-3',
}

const pill = 'inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold'

function matches(q: string, name: string, description: string) {
  return !q || name.toLowerCase().includes(q) || description.toLowerCase().includes(q)
}

function ValueCell({ row }: { row: ConfigRow }) {
  if (!scopeHasValue[row.scope] || row.value === '') return <span className="text-ink-5">{t.noValue}</span>
  if (row.value === 'true' || row.value === 'false') {
    const on = row.value === 'true'
    return (
      <span className={cn('inline-flex items-center gap-1.5 font-medium', on ? 'text-success-ink' : 'text-ink-4')}>
        <span aria-hidden="true" className={cn('size-[7px] rounded-full', on ? 'bg-success' : 'bg-ink-5')} />
        {row.value}
      </span>
    )
  }
  return <span className="font-mono text-xs">{row.value}</span>
}

function GroupRow({ label, count }: { label: string; count: number }) {
  return (
    <tr className="bg-bg">
      <td colSpan={6} className="px-4 py-2">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-ink-3">
          {label}
          <span className="font-medium text-ink-4">{t.groupCount(count)}</span>
        </span>
      </td>
    </tr>
  )
}

const th = 'whitespace-nowrap px-4 py-2.5 text-left text-[11px] font-semibold tracking-wide text-ink-4'
const td = 'px-4 py-2.5 align-middle text-[13px]'

/** 컨피그 탭 (조회 전용) */
export function ConfigTab() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('ALL')

  const q = query.trim().toLowerCase()
  const tenantRows = MOCK_CONFIGS.filter((r) => filter !== 'PUBLIC' && (filter === 'ALL' || r.scope === filter) && matches(q, r.name, r.description))
  const publicRows = MOCK_PUBLIC_CONFIGS.filter((r) => (filter === 'ALL' || filter === 'PUBLIC') && matches(q, r.name, r.description))
  const shown = tenantRows.length + publicRows.length

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: 'ALL', label: t.filterAll, count: MOCK_CONFIGS.length + MOCK_PUBLIC_CONFIGS.length },
    ...scopes.map((s) => ({ key: s, label: t.typeLabel[s], count: MOCK_CONFIGS.filter((r) => r.scope === s).length })),
    { key: 'PUBLIC', label: t.filterPublic, count: MOCK_PUBLIC_CONFIGS.length },
  ]

  return (
    <section aria-labelledby="config-title" className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-3">
        <h2 id="config-title" className="m-0 text-[13px] font-semibold">
          {t.title}
        </h2>
        <span className="text-xs text-ink-4">{t.description}</span>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line-soft px-4 py-3">
          <form role="search" className="flex w-full max-w-[360px] items-center gap-2" onSubmit={(e) => e.preventDefault()}>
            <SearchInput aria-label={t.searchLabel} placeholder={t.searchPlaceholder} value={query} onChange={(e) => setQuery(e.target.value)} />
            <Button type="submit" variant="dark" size="sm" icon={<SearchIcon size={14} strokeWidth={2.4} />}>
              {texts.common.action.search}
            </Button>
          </form>
          <span className="flex-1" />
          <div role="group" aria-label={t.filterLabel} className="inline-flex rounded-ctl bg-fill-strong p-0.5">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                aria-pressed={filter === f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  'inline-flex h-[30px] items-center gap-1.5 rounded-md px-3 text-[12.5px] font-medium',
                  filter === f.key ? 'bg-surface text-ink shadow-seg' : 'text-ink-2',
                )}
              >
                {f.label}
                <span className="text-[11px] tabular-nums text-ink-4">{f.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse">
            <thead>
              <tr className="border-b border-line-soft">
                <th scope="col" className={th}>{t.columns.type}</th>
                <th scope="col" className={th}>{t.columns.name}</th>
                <th scope="col" className={th}>{t.columns.value}</th>
                <th scope="col" className={th}>{t.columns.description}</th>
                <th scope="col" className={th}>{t.columns.appliedAt}</th>
                <th scope="col" className={th}>{t.columns.appliedBy}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {publicRows.length > 0 && (
                <>
                  <GroupRow label={t.publicGroup} count={publicRows.length} />
                  {publicRows.map((r) => (
                    <tr key={r.id} className="hover:bg-hover">
                      <td className={td}>
                        <span className={cn(pill, 'bg-biz-soft text-biz-ink')}>PUBLIC</span>
                      </td>
                      <td className={td}>
                        <code className="font-mono text-xs">{r.name}</code>
                      </td>
                      <td className={cn(td, 'text-ink-5')}>{t.noValue}</td>
                      <td className={cn(td, 'text-ink-2')}>{r.description}</td>
                      <td className={cn(td, 'tabular-nums text-ink-3')}>{r.appliedAt}</td>
                      <td className={cn(td, 'text-ink-3')}>{r.appliedBy}</td>
                    </tr>
                  ))}
                </>
              )}
              {publicRows.length > 0 && tenantRows.length > 0 && <GroupRow label={t.tenantGroup} count={tenantRows.length} />}
              {tenantRows.map((r) => (
                <tr key={r.id} className="hover:bg-hover">
                  <td className={td}>
                    <span className={cn(pill, scopeTone[r.scope])}>{t.typeLabel[r.scope]}</span>
                  </td>
                  <td className={td}>
                    <code className="font-mono text-xs">{r.name}</code>
                  </td>
                  <td className={td}>
                    <ValueCell row={r} />
                  </td>
                  <td className={cn(td, 'text-ink-2')}>{r.description}</td>
                  <td className={cn(td, 'tabular-nums text-ink-3')}>{r.appliedAt}</td>
                  <td className={cn(td, 'text-ink-3')}>{r.appliedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {shown === 0 && <EmptyState title={t.emptyTitle} description={t.emptyDescription} />}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line-soft bg-bg/60 px-4 py-2.5 text-xs text-ink-4">
          <span>{t.footer(shown, MOCK_CONFIG_SYNCED_AT)}</span>
          <a href="#config" className="inline-flex items-center gap-1 font-medium text-link hover:underline">
            {t.goManage}
            <ArrowRightIcon size={12} />
          </a>
        </div>
      </Card>
    </section>
  )
}
