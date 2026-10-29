import { useState } from 'react'
import { CheckIcon, DatabaseIcon, RefreshIcon } from '../../components/icons'
import { CompanyShell } from '../../components/layout/CompanyShell'
import { Alert, Button, Card } from '../../components/ui'
import { cn } from '../../lib/cn'
import { formatDateTime } from '../../lib/date'
import { MOCK_BIZ_SYNC_RUNS, MOCK_SYNC_DELAY_MS, MOCK_SYNC_RESULT } from '../../mocks/admin'
import type { SyncRun, SyncStatus } from '../../mocks/admin'
import { texts } from '../../texts'

const t = texts.admin

const statusTone: Record<SyncStatus, string> = {
  SUCCEEDED: 'border-success-line bg-success-soft text-success-ink',
  FAILED: 'border-danger-line bg-danger-soft text-danger-ink',
}

const thClass = 'whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-ink-3'
const tdClass = 'px-3 py-3 align-middle'

/** 관리자 페이지: 운영 데이터를 수동으로 연동한다 */
export function AdminPage() {
  const [runs, setRuns] = useState<SyncRun[]>(MOCK_BIZ_SYNC_RUNS)
  const [running, setRunning] = useState(false)
  // 방금 실행한 연동 결과. 새로 실행하기 전까지 보여 준다
  const [result, setResult] = useState<SyncRun | null>(null)

  const last = runs.find((r) => r.status === 'SUCCEEDED')

  const sync = () => {
    if (running) return
    setRunning(true)
    setResult(null)
    // TODO: 서버 연동 시 POST /api/biz/sync/companies 를 호출한다
    window.setTimeout(() => {
      const run: SyncRun = { id: `s${Date.now()}`, at: formatDateTime(), trigger: 'manual', operator: '홍길동', status: 'SUCCEEDED', ...MOCK_SYNC_RESULT }
      setRuns((prev) => [run, ...prev])
      setResult(run)
      setRunning(false)
    }, MOCK_SYNC_DELAY_MS)
  }

  return (
    <CompanyShell active="admin" noCompany trail={[{ label: t.breadcrumb.admin }]}>
      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 text-[26px] font-bold tracking-[-0.02em]">{t.title}</h1>
        <p className="m-0 text-sm text-ink-3">{t.subtitle}</p>
      </div>

      <section aria-labelledby="admin-sync-title" className="flex flex-col gap-2">
        <h2 id="admin-sync-title" className="m-0 px-3 text-[13px] font-semibold">
          {t.sync.title}
        </h2>
        <Card className="flex flex-col gap-4 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
            <div className="flex min-w-0 flex-1 basis-[420px] items-start gap-3.5">
              <span aria-hidden="true" className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f2f2f5] text-ink-2">
                <DatabaseIcon size={20} />
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <h3 className="m-0 text-[15px] font-bold">{t.sync.source}</h3>
                <p className="m-0 text-[13px] leading-normal text-ink-3">{t.sync.description}</p>
                <span className="text-xs text-ink-4">
                  {t.sync.lastLabel}: <span className="tabular-nums text-ink-3">{last ? last.at : t.sync.neverSynced}</span>
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Button size="lg" loading={running} icon={<RefreshIcon size={16} />} onClick={sync} className="min-w-[200px]">
                {running ? t.sync.running : t.sync.button}
              </Button>
              <span className="text-[11.5px] text-ink-4">{t.sync.note}</span>
            </div>
          </div>

          {result && (
            <div role="status" className="flex flex-col gap-3 rounded-[10px] border border-success-line bg-success-soft px-4 py-3.5">
              <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-success-ink">
                <span aria-hidden="true" className="inline-flex size-4 items-center justify-center rounded-full bg-current">
                  <CheckIcon size={11} strokeWidth={3} className="text-white" />
                </span>
                {t.sync.resultTitle} · {t.sync.done(result.at)}
              </span>
              <dl className="m-0 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {(['scanned', 'created', 'updated', 'unchanged', 'failed'] as const).map((k) => (
                  <div key={k} className="flex flex-col gap-0.5 rounded-lg bg-surface px-3 py-2">
                    <dt className="text-xs text-ink-3">{t.sync.counts[k]}</dt>
                    <dd className={cn('m-0 text-lg font-bold tabular-nums', k === 'failed' && result.failed > 0 && 'text-danger-ink')}>
                      {result[k]}
                      <span className="ml-0.5 text-xs font-medium text-ink-4">{t.sync.unit}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {!running && !result && last === undefined && <Alert>{t.sync.neverSynced}</Alert>}
        </Card>
      </section>

      <section aria-labelledby="admin-runs-title" className="flex flex-col gap-2">
        <h2 id="admin-runs-title" className="m-0 px-3 text-[13px] font-semibold">
          {t.runs.title}
        </h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-[13.5px]">
              <thead>
                <tr>
                  <th scope="col" className={cn(thClass, 'pl-5')}>{t.runs.columns.at}</th>
                  <th scope="col" className={thClass}>{t.runs.columns.trigger}</th>
                  <th scope="col" className={thClass}>{t.runs.columns.operator}</th>
                  <th scope="col" className={thClass}>{t.runs.columns.result}</th>
                  <th scope="col" className={cn(thClass, 'pr-5')}>{t.runs.columns.summary}</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.id} className="border-t border-line-soft">
                    <td className={cn(tdClass, 'whitespace-nowrap pl-5 tabular-nums')}>{r.at}</td>
                    <td className={cn(tdClass, 'whitespace-nowrap text-ink-2')}>{t.runs.trigger[r.trigger]}</td>
                    <td className={cn(tdClass, 'whitespace-nowrap text-ink-2')}>{r.operator}</td>
                    <td className={tdClass}>
                      <span className={cn('inline-flex items-center rounded-full border px-2 py-px text-[11.5px] font-semibold', statusTone[r.status])}>{t.runs.status[r.status]}</span>
                    </td>
                    <td className={cn(tdClass, 'pr-5 tabular-nums text-ink-3')}>{r.status === 'FAILED' ? '-' : t.runs.summary(r.created, r.updated, r.failed)}</td>
                  </tr>
                ))}
                {runs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="border-t border-line-soft px-5 py-8 text-center text-[13px] text-ink-4">
                      {t.runs.empty}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </CompanyShell>
  )
}
