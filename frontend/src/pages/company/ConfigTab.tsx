import { useEffect, useRef, useState } from 'react'
import { ArrowRightIcon, CloseIcon, EyeIcon, InfoIcon, SearchIcon, TenantIcon, WorldIcon } from '../../components/icons'
import { Button, Card, EmptyState } from '../../components/ui'
import { cn } from '../../lib/cn'
import { MOCK_CONFIG_SYNCED_AT, MOCK_CONFIGS, MOCK_PUBLIC_CONFIGS } from '../../mocks/companyDetail'
import type { ConfigRow, ConfigScope } from '../../mocks/companyDetail'
import { texts } from '../../texts'
import { ConfigValueModal } from './ConfigValueModal'
import type { ConfigDetail } from './ConfigValueModal'

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

function ValueCell({ row, onView }: { row: ConfigRow; onView: () => void }) {
  if (!scopeHasValue[row.scope] || row.value === '') return <span className="text-[#c7c7cc]">{t.noValue}</span>
  const isBool = row.value === 'true' || row.value === 'false'
  return (
    <span className="flex items-center gap-2">
      {isBool ? (
        <span className={cn('font-medium', row.value === 'true' ? 'text-[#25736c]' : 'text-ink-4')}>{row.value}</span>
      ) : (
        <span className="max-w-[160px] truncate font-mono text-xs">{row.value.replace(/\s+/g, ' ')}</span>
      )}
      <button
        type="button"
        onClick={onView}
        aria-label={`${row.name} ${t.viewValue}`}
        className="inline-flex h-6 shrink-0 items-center gap-1 rounded-[7px] border border-line-strong bg-surface px-2 text-[11.5px] font-medium text-ink hover:bg-hover"
      >
        <EyeIcon size={12} />
        {t.viewValue}
      </button>
    </span>
  )
}

function DescriptionCell({ row, onView }: { row: { name: string; description: string }; onView: () => void }) {
  return (
    <span className="flex items-center gap-2">
      <span className="max-w-[260px] truncate">{row.description}</span>
      <button
        type="button"
        onClick={onView}
        aria-label={`${row.name} ${t.viewDescription}`}
        className="inline-flex h-6 shrink-0 items-center gap-1 rounded-[7px] border border-line-strong bg-surface px-2 text-[11.5px] font-medium text-ink hover:bg-hover"
      >
        <EyeIcon size={12} />
        {t.viewDescription}
      </button>
    </span>
  )
}

function GroupRow({ variant, label, count }: { variant: 'public' | 'tenant'; label: string; count: number }) {
  const isPublic = variant === 'public'
  return (
    <tr className={isPublic ? 'border-t border-[#fbe08a] bg-[#fff7db]' : 'border-t-2 border-divider bg-[#fafafb]'}>
      <td colSpan={6} className="px-5 py-[9px]">
        <span className={cn('inline-flex items-center gap-2 text-xs', isPublic ? 'text-[#7a5800]' : 'text-ink-2')}>
          {isPublic ? <WorldIcon size={14} /> : <TenantIcon size={14} />}
          <span className="font-semibold">{label}</span>
          <span className={isPublic ? 'text-[#b07a2a]' : 'text-ink-4'}>{t.groupCount(count)}</span>
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
  const [viewing, setViewing] = useState<ConfigDetail | null>(null)
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copyDetail = async ({ field, row }: ConfigDetail) => {
    try {
      await navigator.clipboard.writeText(field === 'value' && 'value' in row ? row.value : row.description)
    } catch {
      // 클립보드 권한이 없으면 복사됨 표시를 하지 않는다
      return
    }
    setCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 1600)
  }

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
      <div className="mb-2.5 flex flex-wrap items-start gap-2.5 rounded-xl border border-line-strong bg-[#f2f2f5] px-3.5 py-3 text-[13px] leading-normal">
        <InfoIcon size={15} className="mt-0.5 shrink-0 text-ink-3" />
        <span>{t.description}</span>
        <a href="#config" className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-link hover:underline">
          {t.goManage}
          <ArrowRightIcon size={12} />
        </a>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-3">
        <h2 id="config-title" className="m-0 text-[13px] font-semibold">
          {t.title}
        </h2>
        <span className="text-xs text-ink-4">{t.footer(shown, MOCK_CONFIG_SYNCED_AT)}</span>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line-soft px-4 py-3">
          <form role="search" className="flex w-full max-w-[420px] gap-2.5" onSubmit={(e) => e.preventDefault()}>
            <label className="relative block flex-1">
              <span className="pointer-events-none absolute left-[13px] top-[11px] inline-flex text-ink-4">
                <SearchIcon size={16} strokeWidth={2.2} />
              </span>
              <input
                type="text"
                autoComplete="off"
                aria-label={t.searchLabel}
                placeholder={t.searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-[38px] w-full rounded-[10px] border-0 bg-surface px-[38px] text-sm text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] placeholder:text-ink-4 focus:outline-none focus:shadow-[0_0_0_3px_rgb(35_100_170/0.22)]"
              />
              {query && (
                <button type="button" aria-label={t.searchClear} onClick={() => setQuery('')} className="absolute right-[9px] top-2.5 inline-flex size-[18px] items-center justify-center rounded-full bg-ink-5 p-0 text-white">
                  <CloseIcon size={9} strokeWidth={3} />
                </button>
              )}
            </label>
            <Button type="submit" variant="dark" icon={<SearchIcon size={14} strokeWidth={2.4} />} className="h-[38px] rounded-[10px] px-[18px] text-[13.5px] font-semibold">
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
              <tr className="border-b border-line-soft bg-[#fafafb]">
                <th scope="col" className={th}>{t.columns.type}</th>
                <th scope="col" className={th}>{t.columns.name}</th>
                <th scope="col" className={th}>{t.columns.value}</th>
                <th scope="col" className={th}>{t.columns.description}</th>
                <th scope="col" className={th}>{t.columns.appliedAt}</th>
                <th scope="col" className={th}>{t.columns.appliedBy}</th>
              </tr>
            </thead>
            <tbody>
              {publicRows.length > 0 && (
                <>
                  <GroupRow variant="public" label={t.publicGroup} count={publicRows.length} />
                  {publicRows.map((r) => (
                    <tr key={r.id} className="border-t border-[#fbefd6] bg-[#fffcf5]">
                      <td className={td}>
                        <span className={cn(pill, 'border border-[#fbe08a] bg-[#fff1d6] text-[#7a5800]')}>PUBLIC</span>
                      </td>
                      <td className={td}>
                        <code className="rounded-md bg-[#fbf1dd] px-[7px] py-0.5 font-mono text-xs text-ink">{r.name}</code>
                      </td>
                      <td className={cn(td, 'text-[#c7c7cc]')}>{t.noValue}</td>
                      <td className={cn(td, 'text-ink-2')}>
                        <DescriptionCell row={r} onView={() => setViewing({ field: 'description', row: r })} />
                      </td>
                      <td className={cn(td, 'tabular-nums text-ink-3')}>{r.appliedAt}</td>
                      <td className={cn(td, 'text-ink-3')}>{r.appliedBy}</td>
                    </tr>
                  ))}
                </>
              )}
              {publicRows.length > 0 && tenantRows.length > 0 && <GroupRow variant="tenant" label={t.tenantGroup} count={tenantRows.length} />}
              {tenantRows.map((r) => (
                <tr key={r.id} className="border-t border-line-soft hover:bg-hover">
                  <td className={td}>
                    <span className={cn(pill, scopeTone[r.scope])}>{t.typeLabel[r.scope]}</span>
                  </td>
                  <td className={td}>
                    <code className="rounded-md bg-[#f2f2f5] px-[7px] py-0.5 font-mono text-xs text-ink">{r.name}</code>
                  </td>
                  <td className={td}>
                    <ValueCell row={r} onView={() => setViewing({ field: 'value', row: r })} />
                  </td>
                  <td className={cn(td, 'text-ink-2')}>
                    <DescriptionCell row={r} onView={() => setViewing({ field: 'description', row: r })} />
                  </td>
                  <td className={cn(td, 'tabular-nums text-ink-3')}>{r.appliedAt}</td>
                  <td className={cn(td, 'text-ink-3')}>{r.appliedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {shown === 0 && <EmptyState title={t.emptyTitle} description={t.emptyDescription} />}
        </div>
      </Card>
      {viewing && <ConfigValueModal detail={viewing} copied={copied} onCopy={() => void copyDetail(viewing)} onClose={() => setViewing(null)} />}
    </section>
  )
}
