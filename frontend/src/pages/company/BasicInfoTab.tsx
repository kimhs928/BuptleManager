import type { ReactNode } from 'react'
import { Card, Lines, PlatformDot } from '../../components/ui'
import { InfoIcon, LockIcon } from '../../components/icons'
import { cn } from '../../lib/cn'
import { platformLabel } from '../../lib/platform'
import { MOCK_CONFIGS, MOCK_OPS, MOCK_RECENT_JOBS } from '../../mocks/companyDetail'
import type { CompanyDetail } from '../../mocks/companyDetail'
import { texts } from '../../texts'

const t = texts.company.basic

/** 정의 목록의 한 행 */
function Field({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={cn('flex min-h-[42px] items-center justify-between gap-4 border-b border-line-soft last:border-b-0', wide && 'col-span-2')}>
      <dt className="shrink-0 text-[13px] font-medium text-ink-2">{label}</dt>
      <dd className="m-0 text-right text-[13px] font-medium tabular-nums text-ink">{children}</dd>
    </div>
  )
}

function StatusDot({ className }: { className: string }) {
  return <span aria-hidden="true" className={cn('inline-block size-2 rounded-full', className)} />
}

type Props = {
  company: CompanyDetail
  liveUserCount: number
}

/** 기본 정보 탭 (조회 전용) */
export function BasicInfoTab({ company, liveUserCount }: Props) {
  const ops = [
    { label: t.ops.configs, value: `${MOCK_CONFIGS.length}${t.unit.count}` },
    { label: t.ops.online, value: `${liveUserCount}${t.unit.person}` },
    { label: t.ops.jobs, value: `${MOCK_OPS.jobs}${t.unit.job}` },
    { label: t.ops.tickets, value: `${MOCK_OPS.tickets}${t.unit.job}` },
  ]

  return (
    <div className="grid grid-cols-1 items-start gap-7 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <section aria-labelledby="company-basic" className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3 px-3">
          <h2 id="company-basic" className="m-0 text-[13px] font-semibold">
            {t.infoTitle}
          </h2>
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-4">
            <LockIcon size={12} />
            {t.readOnly}
          </span>
        </div>

        <Card className="overflow-hidden">
          <dl className="m-0 grid grid-cols-2 gap-x-7 px-4">
            <Field label={t.fields.name}>{company.name}</Field>
            <Field label={t.fields.representative}>{company.representative}</Field>
            <Field label={t.fields.businessNo}>{company.businessNo}</Field>
            <Field label={t.fields.phone}>{company.phone}</Field>
            <Field label={t.fields.domain}>
              <a href={`https://${company.domain}`} target="_blank" rel="noreferrer" className="text-link hover:underline">
                {company.domain}
              </a>
            </Field>
            <Field label={t.fields.schema}>
              <code className="rounded-md bg-[#ebebf0] px-2 py-0.5 font-mono text-[12.5px]">{company.schema}</code>
            </Field>
            <Field label={t.fields.createdAt}>{company.createdAt}</Field>
            <Field label={t.fields.status}>
              <span className="inline-flex items-center gap-1.5">
                <StatusDot className={company.active ? 'bg-success' : 'bg-line-strong'} />
                {company.active ? t.statusActive : t.statusInactive}
                <span className="font-mono text-xs font-normal text-ink-4">(isdeleted = {String(!company.active)})</span>
              </span>
            </Field>
            <Field label={t.fields.users}>
              {texts.company.summary.count(company.users)} <span className="text-xs font-normal text-ink-4">{t.userLimit(company.userLimit)}</span>
            </Field>
            <Field label={t.fields.service}>
              <span className="inline-flex items-center gap-1.5">
                <PlatformDot platform={company.platform} />
                {platformLabel[company.platform]}
              </span>
            </Field>
            <Field label={t.fields.address} wide>
              {company.address}
            </Field>
          </dl>
        </Card>

        <div className="mt-2.5 flex items-start gap-2.5 rounded-xl border border-line-strong bg-[#f2f2f5] px-3.5 py-3 text-[13px] leading-normal">
          <InfoIcon size={15} className="mt-0.5 shrink-0 text-ink-3" />
          <span>
            <Lines lines={t.syncedNotice} />
          </span>
        </div>
      </section>

      <div className="flex flex-col gap-6">
        <section aria-labelledby="company-ops" className="flex flex-col gap-1.5">
          <h2 id="company-ops" className="m-0 px-3 text-[13px] font-semibold">
            {t.opsTitle}
          </h2>
          <dl className="m-0 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line-soft shadow-card">
            {ops.map((o) => (
              <div key={o.label} className="flex flex-col gap-1 bg-surface px-4 py-3.5">
                <dt className="text-xs text-ink-4">{o.label}</dt>
                <dd className="m-0 text-xl font-bold tabular-nums tracking-[-0.02em]">{o.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="company-recent" className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3 px-3">
            <h2 id="company-recent" className="m-0 text-[13px] font-semibold">
              {t.recentTitle}
            </h2>
            <a href="#history" className="text-xs text-link hover:underline">
              {t.recentAll}
            </a>
          </div>
          <Card className="overflow-hidden">
            <ul className="m-0 list-none divide-y divide-line-soft p-0">
              {MOCK_RECENT_JOBS.map((j) => (
                <li key={j.id} className="flex items-start gap-2.5 px-4 py-3">
                  <span aria-hidden="true" className="mt-[7px] size-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-[13px] font-medium">{j.title}</span>
                    <span className="text-xs text-ink-4">{j.meta}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      </div>
    </div>
  )
}
