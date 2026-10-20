import { useState } from 'react'
import { CheckIcon, CloseIcon, DownloadIcon } from '../../components/icons'
import { CompanyShell } from '../../components/layout/CompanyShell'
import { Alert, Card, TextInput } from '../../components/ui'
import { cn } from '../../lib/cn'
import { MOCK_COMPANY_DETAIL } from '../../mocks/companyDetail'
import { MOCK_ERROR_REPORTS, MOCK_REPORT_TODAY } from '../../mocks/report'
import type { ReportKind } from '../../mocks/report'
import { texts } from '../../texts'
import { ReportConfirmModal } from './ReportConfirmModal'

const t = texts.report
const KINDS: ReportKind[] = ['contract', 'counsel']

const pad = (n: number) => String(n).padStart(2, '0')

/** 'YYYY-MM-DD'에 일수를 더한다 */
function addDays(day: string, n: number): string {
  const d = new Date(`${day}T00:00:00`)
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

type Done = { name: string; count: number; ticket: string }

/** 오류 리포트 추출 */
export function ReportPage() {
  const [kind, setKind] = useState<ReportKind | null>(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [done, setDone] = useState<Done | null>(null)

  const company = MOCK_COMPANY_DETAIL.name
  const invalid = from !== '' && to !== '' && from > to
  const periodReady = from !== '' && to !== '' && !invalid
  const ready = kind !== null && periodReady
  const rows = ready ? MOCK_ERROR_REPORTS[kind].filter((r) => r.at.slice(0, 10) >= from && r.at.slice(0, 10) <= to) : []
  const canExtract = ready && rows.length > 0

  const today = MOCK_REPORT_TODAY
  const monthStart = `${today.slice(0, 8)}01`
  const lastMonthEnd = addDays(monthStart, -1)
  const presets = [
    { label: t.step2.presets.week, from: addDays(today, -6), to: today },
    { label: t.step2.presets.month, from: addDays(today, -29), to: today },
    { label: t.step2.presets.thisMonth, from: monthStart, to: today },
    { label: t.step2.presets.lastMonth, from: `${lastMonthEnd.slice(0, 8)}01`, to: lastMonthEnd },
  ]

  const kindLabel = kind ? t.step1.kinds[kind].label : '-'
  const period = periodReady ? `${from} ~ ${to}` : '-'
  const fileName = kind ? `error_report_${kind}_${from.replace(/-/g, '')}-${to.replace(/-/g, '')}.xlsx` : ''

  const changeKind = (next: ReportKind) => {
    setKind(next)
    setDone(null)
  }
  const changePeriod = (nextFrom: string, nextTo: string) => {
    setFrom(nextFrom)
    setTo(nextTo)
    setDone(null)
  }

  return (
    <CompanyShell active="errorReport" trail={[{ label: t.breadcrumb.features }, { label: t.breadcrumb.report }]}>
      {done && (
        <div role="status" className="flex items-center gap-3 rounded-xl border border-success-line bg-success-soft py-[11px] pl-4 pr-3.5 text-[13px] text-success-ink">
          <span aria-hidden="true" className="inline-flex size-[22px] shrink-0 items-center justify-center rounded-full bg-success text-white">
            <CheckIcon size={13} strokeWidth={3} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.45]">
            <span className="font-semibold">{t.done.title}</span>
            <span className="break-all">{t.done.detail(done.name, done.count, done.ticket)}</span>
          </span>
          <a href="#download" className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-ctl border border-success-line bg-surface px-3 text-[12.5px] font-medium text-ink hover:bg-hover">
            <DownloadIcon size={13} />
            {t.done.download}
          </a>
          <button type="button" aria-label={t.done.close} onClick={() => setDone(null)} className="inline-flex size-[26px] items-center justify-center rounded-md hover:bg-success-line/60">
            <CloseIcon size={14} />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 text-[26px] font-bold tracking-[-0.02em]">{t.title}</h1>
        <p className="m-0 text-sm text-ink-3">{t.description(company)}</p>
      </div>

      <section aria-label={t.step1.title} className="flex flex-col gap-2">
        <span className="px-3 text-[13px] font-semibold">{t.step1.title}</span>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {KINDS.map((k) => {
            const on = kind === k
            return (
              <button
                key={k}
                type="button"
                aria-pressed={on}
                onClick={() => changeKind(k)}
                className={cn(
                  'flex cursor-pointer flex-col gap-2 rounded-xl p-4 text-left',
                  on ? 'border border-primary bg-[#f2f2f5] shadow-[0_0_0_3px_rgba(35,100,170,0.15)]' : 'border border-line-strong bg-surface hover:bg-hover',
                )}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-[15px] font-semibold">{t.step1.kinds[k].label}</span>
                  <span
                    aria-hidden="true"
                    className={cn('inline-flex size-5 shrink-0 items-center justify-center rounded-full', on ? 'bg-primary text-white' : 'border-[1.5px] border-[#c7c7cc] bg-surface text-transparent')}
                  >
                    <CheckIcon size={12} strokeWidth={3} />
                  </span>
                </span>
                <span className="text-[12.5px] leading-normal text-ink-3">{t.step1.kinds[k].desc}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section aria-label={t.step2.title} className="flex flex-col gap-2">
        <span className="px-3 text-[13px] font-semibold">{t.step2.title}</span>
        <Card className="flex flex-col gap-3.5 px-5 py-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-2">
              <span>
                {t.step2.from} <span className="text-danger-ink">*</span>
              </span>
              <TextInput type="date" value={from} onChange={(e) => changePeriod(e.target.value, to)} aria-invalid={invalid || undefined} className="w-[180px]" />
            </label>
            <span aria-hidden="true" className="pb-2.5 text-ink-4">
              ~
            </span>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-2">
              <span>
                {t.step2.to} <span className="text-danger-ink">*</span>
              </span>
              <TextInput type="date" value={to} onChange={(e) => changePeriod(from, e.target.value)} aria-invalid={invalid || undefined} className="w-[180px]" />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs text-ink-4">{t.step2.quick}</span>
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => changePeriod(p.from, p.to)}
                className="inline-flex h-[28px] items-center rounded-full bg-fill px-3 text-xs font-medium text-ink hover:bg-fill-strong"
              >
                {p.label}
              </button>
            ))}
          </div>
          {invalid && <Alert tone="danger">{t.step2.invalid}</Alert>}
        </Card>
      </section>

      {ready ? (
        <>
          <section aria-label={t.step3.title} className="flex flex-col gap-2">
            <span className="px-3 text-[13px] font-semibold">3. {t.step3.title}</span>
            <Card className="flex flex-wrap items-stretch gap-5 px-5 py-4">
              <dl className="m-0 grid min-w-0 flex-1 grid-cols-2 gap-3 lg:grid-cols-3">
                {(
                  [
                    [t.step3.kind, kindLabel, ''],
                    [t.step3.period, period, 'tabular-nums'],
                    [t.step3.format, t.step3.formatValue, ''],
                  ] as const
                ).map(([label, value, cls]) => (
                  <div key={label} className="flex min-w-0 flex-col justify-center gap-1 rounded-[10px] bg-bg px-3.5 py-3">
                    <dt className="text-[11.5px] text-ink-4">{label}</dt>
                    <dd className={cn('m-0 break-all text-[15px] font-semibold', cls)}>{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex shrink-0 flex-col items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={!canExtract}
                  onClick={() => setConfirming(true)}
                  className={cn(
                    'inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border-0 px-6 text-[15px] font-semibold',
                    canExtract ? 'cursor-pointer bg-[#73bfb8] text-[#0f3b37] hover:brightness-105' : 'cursor-not-allowed bg-[#f2f2f5] text-ink-5',
                  )}
                >
                  <DownloadIcon size={16} />
                  {t.step3.extract}
                </button>
                {!canExtract && <span className="text-center text-xs leading-normal text-danger-ink">{t.step3.noteEmpty}</span>}
              </div>
            </Card>
          </section>
        </>
      ) : (
        <section aria-label={t.step3.title} className="flex items-start gap-3 rounded-card border border-dashed border-line-strong bg-surface px-5 py-4">
          <span aria-hidden="true" className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-fill text-xs font-bold text-ink-3">
            3
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-semibold">{t.step3.title}</span>
            <span className="text-xs leading-normal text-ink-4">{t.step3.hint}</span>
          </div>
        </section>
      )}

      {confirming && kind && (
        <ReportConfirmModal
          summary={`${kindLabel} · ${period} · ${t.step3.unit(rows.length)}`}
          count={rows.length}
          conditions={[
            { label: t.confirm.labels.kind, value: kindLabel },
            { label: t.confirm.labels.period, value: period },
            { label: t.confirm.labels.count, value: t.step3.unit(rows.length) },
            { label: t.confirm.labels.file, value: fileName },
          ]}
          onClose={() => setConfirming(false)}
          onRun={(ticket) => {
            setConfirming(false)
            setDone({ name: fileName, count: rows.length, ticket })
          }}
        />
      )}
    </CompanyShell>
  )
}
