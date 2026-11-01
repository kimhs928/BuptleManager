import { ChevronRightIcon } from '../../components/icons'
import { MAIN_HREF } from '../../components/layout/CompanyShell'
import { Card } from '../../components/ui'
import { useRecentContracts } from '../../hooks/useRecentContracts'
import { cn } from '../../lib/cn'
import { formatDateTime } from '../../lib/date'
import { loadSelectedCompany } from '../../lib/selectedCompany'
import { texts } from '../../texts'
import { tableTd, tableTh } from './format'

const t = texts.contract.search
const r = t.recent

/** 최근 작업한 계약. 선택한 고객사의 작업 이력(BuptleManager DB)에서 가져온다 */
export function RecentContractsCard() {
  // 고객사를 고르지 않았으면 다른 고객사를 보여 주지 않고 선택을 안내한다
  const selected = loadSelectedCompany()
  const { items, loading, error } = useRecentContracts(selected?.schema ?? null)

  return (
    <section aria-label={t.recentTitle}>
      <Card className="overflow-hidden">
        <div className="flex items-baseline gap-2 border-b border-line-soft px-5 py-4">
          <span className="text-[15px] font-semibold">{t.recentTitle}</span>
          {selected && !loading && !error && (
            <span className="text-[13px] text-ink-4" aria-live="polite">
              {r.count(items.length)}
            </span>
          )}
        </div>

        {items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-[13.5px]">
              <thead>
                <tr>
                  <th scope="col" className={cn(tableTh, 'w-[130px] pl-5')}>{t.columns.id}</th>
                  <th scope="col" className={tableTh}>{t.columns.name}</th>
                  <th scope="col" className={tableTh}>{r.columns.operation}</th>
                  <th scope="col" className={tableTh}>{r.columns.operatedAt}</th>
                  <th scope="col" className={tableTh}>{r.columns.operator}</th>
                  <th scope="col" className={cn(tableTh, 'pr-5')}>
                    <span className="sr-only">{t.detail}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.contractId} className="border-t border-line-soft bg-surface hover:bg-hover">
                    <td className={cn(tableTd, 'whitespace-nowrap pl-5 font-mono text-[12.5px] text-ink-2')}>{c.contractId}</td>
                    <td className={cn(tableTd, 'min-w-[200px] font-medium text-ink')}>{c.name || '-'}</td>
                    <td className={cn(tableTd, 'whitespace-nowrap text-ink-3')}>{r.operations[c.lastOperation]}</td>
                    <td className={cn(tableTd, 'whitespace-nowrap tabular-nums text-ink-3')}>{formatDateTime(new Date(c.operatedAt))}</td>
                    <td className={cn(tableTd, 'whitespace-nowrap text-ink-3')}>{c.operator}</td>
                    <td className={cn(tableTd, 'whitespace-nowrap pr-5 text-right')}>
                      <a href={`?contract=${c.contractId}`} className="inline-flex h-7 items-center gap-1 rounded-ctl border border-line-strong bg-surface px-2.5 text-[12.5px] font-medium text-ink hover:bg-hover">
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
            <p role={error ? 'alert' : 'status'} className="m-0 text-[15px] font-semibold text-ink-2">
              {!selected ? r.noCompany : loading ? r.loading : error ? r.error : r.empty}
            </p>
            {!selected && (
              <a href={MAIN_HREF} className="text-[13px] font-medium text-link hover:underline">
                {r.goMain}
              </a>
            )}
          </div>
        )}
      </Card>
    </section>
  )
}
