import { useState } from 'react'
import type { ReactNode } from 'react'
import { EditIcon, FileIcon, LockIcon } from '../../components/icons'
import { Button } from '../../components/ui'
import { cn } from '../../lib/cn'
import { MOCK_CONTRACT_DOCS, MOCK_CONTRACT_TEMPLATE, STAGE_ORDER } from '../../mocks/contract'
import type { ContractDetail, HistoryRow } from '../../mocks/contract'
import { texts } from '../../texts'
import { BasicEditModal } from './BasicEditModal'
import { showDateTime } from './format'
import { StatusDot } from './shared'

const t = texts.contract.basic

/** 시안의 카드: 둥근 흰 박스 */
const box = 'overflow-hidden rounded-card border border-line bg-surface shadow-card'

function Block({ id, title, aside, children }: { id: string; title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3 px-3">
        <h2 id={id} className="m-0 text-[13px] font-semibold">
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

function Row({ label, children, mono }: { label: string; children: ReactNode; mono?: boolean }) {
  return (
    <div className="flex min-h-[38px] items-center justify-between gap-4 border-t border-line-soft px-3.5 first:border-t-0">
      <dt className="shrink-0 text-[13px]">{label}</dt>
      <dd className={cn('m-0 text-right text-[13px] text-ink-3', mono && 'font-mono')}>{children}</dd>
    </div>
  )
}

function Stack({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-t border-line-soft px-3.5 py-2.5 first:border-t-0">
      <dt className="text-xs text-ink-4">{label}</dt>
      <dd className="m-0 text-[13px]">{children}</dd>
    </div>
  )
}

/** 최근 히스토리의 점 색: 도착 단계 기준 */
function stageDot(stage: string): string {
  if (stage.includes('서명')) return 'bg-[#3da5d9]'
  if ((STAGE_ORDER[stage] ?? 0) === 0) return 'bg-ink-5'
  return 'bg-success'
}

type Props = {
  contract: ContractDetail
  /** 삭제되지 않은 히스토리 최근순 */
  recentHistory: HistoryRow[]
  historyCount: number
  onSave: (next: ContractDetail, changeCount: number, ticket: string) => void
  onShowHistory: () => void
  onShowWorkflow: () => void
}

/** 기본 정보 탭 */
export function BasicTab({ contract, recentHistory, historyCount, onSave, onShowHistory, onShowWorkflow }: Props) {
  const [editing, setEditing] = useState(false)
  const docs = MOCK_CONTRACT_DOCS
  const tpl = MOCK_CONTRACT_TEMPLATE

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] xl:gap-7">
        <div className="flex items-center justify-end gap-3">
          <span className="text-xs text-ink-4">{t.editHint}</span>
          <Button size="md" icon={<EditIcon size={14} />} onClick={() => setEditing(true)} className="h-9 rounded-ctl px-[18px] font-semibold">
            {t.edit}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-7 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <Block id="contract-info" title={t.infoTitle}>
            <dl className={cn(box, 'm-0')}>
              <Row label={t.fields.id} mono>
                {contract.id}
              </Row>
              <Row label={t.fields.status}>
                <StatusDot status={contract.status} />
              </Row>
              <Row label={t.fields.name}>{contract.name}</Row>
              <div className="flex flex-col gap-2 border-t border-line-soft px-3.5 pb-3 pt-2.5">
                <dt className="text-[13px]">{t.fields.summary}</dt>
                <dd className="m-0">
                  {/* 길면 이 영역 안에서만 스크롤한다 */}
                  <div tabIndex={0} role="region" aria-label={t.summaryLabel} className="max-h-[92px] overflow-y-auto whitespace-pre-wrap rounded-[10px] bg-bg px-3 py-[9px] text-[13px] leading-[1.6] text-ink-2">
                    {contract.summary}
                  </div>
                </dd>
              </div>
              <Row label={t.fields.amount}>
                <span className="tabular-nums">{texts.contract.won(contract.amount)}</span>
              </Row>
              <Row label={t.fields.lang}>{texts.contract.lang[contract.lang]}</Row>
              <Row label={t.fields.migration}>{contract.migration ? t.migrationYes : t.migrationNo}</Row>
              <Row label={t.fields.deleted}>{contract.deleted ? t.deletedYes : t.deletedNo}</Row>
            </dl>
          </Block>

          <Block id="contract-dates" title={t.datesTitle}>
            <div className={cn(box, 'grid grid-cols-1 sm:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,0.65fr)]')}>
              <div className="flex flex-col gap-2 px-4 py-3">
                <span className="text-xs text-ink-4">{t.period}</span>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[11.5px] text-ink-4">{t.startDate}</span>
                    <span className="text-[15px] font-semibold tabular-nums">{contract.startDate}</span>
                  </span>
                  <span aria-hidden="true" className="mt-3.5 text-ink-5">
                    →
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[11.5px] text-ink-4">{t.endDate}</span>
                    <span className="text-[15px] font-semibold tabular-nums">{contract.endDate}</span>
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 border-t border-line-soft px-4 py-3 sm:border-l sm:border-t-0">
                <span className="text-xs text-ink-4">{t.createdModified}</span>
                <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-x-2 gap-y-1 text-[13px] tabular-nums">
                  <span className="text-ink-4">{t.created}</span>
                  <span className="font-medium">{showDateTime(contract.createdAt)}</span>
                  <span className="text-ink-4">{t.modified}</span>
                  <span className="font-medium">{showDateTime(contract.updatedAt)}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 border-t border-line-soft px-4 py-3 sm:border-l sm:border-t-0">
                <span className="text-xs text-ink-4">{t.deletedAt}</span>
                <span className={cn('text-[13px] tabular-nums', contract.deletedAt ? 'font-medium' : 'text-ink-5')}>{showDateTime(contract.deletedAt)}</span>
              </div>
            </div>
          </Block>

          <Block id="contract-props" title={t.propsTitle}>
            <dl className={cn(box, 'm-0 grid grid-cols-2 lg:grid-cols-4')}>
              {(
                [
                  [t.props.kind, contract.kind],
                  [t.props.sign, contract.signType],
                  [t.props.grade, contract.grade],
                ] as const
              ).map(([label, value], i) => (
                <div key={label} className={cn('flex flex-col gap-1 px-4 py-3', i > 0 && 'border-l border-line-soft')}>
                  <dt className="text-xs text-ink-4">{label}</dt>
                  <dd className="m-0 text-sm font-medium">{value}</dd>
                </div>
              ))}
              <div className="flex flex-col gap-1 border-l border-line-soft px-4 py-3">
                <dt className="text-xs text-ink-4">{t.props.autoRenew}</dt>
                <dd className="m-0 flex items-center gap-[7px] text-sm font-medium">
                  <span aria-hidden="true" className={cn('inline-block size-2 rounded-full', contract.autoRenew ? 'bg-success' : 'bg-ink-5')} />
                  {contract.autoRenew ? t.autoRenewOn : t.autoRenewOff}
                </dd>
              </div>
            </dl>
          </Block>

          <Block id="contract-docs" title={t.docsTitle}>
            <ul className={cn(box, 'm-0 list-none p-0')}>
              {docs.map((d, i) => (
                <li key={d.id} className={cn('flex items-center gap-3 border-t border-line-soft first:border-t-0', i === 0 ? 'min-h-12 px-3.5' : 'ml-12 min-h-11 pr-3.5')}>
                  {i === 0 && <FileIcon size={22} className="shrink-0 text-ink-4" />}
                  <span className="flex min-w-0 flex-1 flex-col gap-px">
                    <span className="truncate text-[13px]">{d.name}</span>
                    <span className="text-xs text-ink-4">{d.kind}</span>
                  </span>
                  <a href={`#doc-${d.id}`} className="text-[13px] text-link hover:underline">
                    {t.docView}
                  </a>
                </li>
              ))}
            </ul>
          </Block>
        </div>

        <div className="flex flex-col gap-6">
          <Block
            id="contract-template"
            title={t.templateTitle}
            aside={
              <span className="inline-flex items-center gap-[5px] text-xs text-ink-4">
                <LockIcon size={12} />
                <span>{t.readOnly}</span>
              </span>
            }
          >
            <dl className={cn(box, 'm-0')}>
              <Stack label={t.template.name}>{tpl.name}</Stack>
              <Stack label={t.template.category}>
                <span className="text-ink-3">{tpl.categoryParent}</span>{' '}
                <span aria-label={t.subCategory} className="text-ink-5">
                  ›
                </span>{' '}
                {tpl.category}
              </Stack>
              <Stack label={t.template.description}>
                <span className="leading-normal">{tpl.description}</span>
              </Stack>
              <div className="flex flex-col gap-1 border-t border-line-soft px-3.5 py-2.5">
                <dt className="text-xs text-ink-4">{t.template.draftUpload}</dt>
                <dd className="m-0 flex flex-wrap items-center gap-2 text-[13px]">
                  <span className="rounded-full border border-success-line bg-success-soft px-2 py-px text-[11px] font-semibold text-success-ink">{tpl.draftUpload ? 'Y' : 'N'}</span>
                  <span className="text-xs text-ink-3">{tpl.draftUploadLabel}</span>
                </dd>
              </div>
              <Row label={t.template.draftFile}>
                <a href="#draft" className="text-link hover:underline">
                  {tpl.draftFile}
                </a>
              </Row>
            </dl>
          </Block>

          <section aria-labelledby="contract-recent" className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between px-3">
              <h2 id="contract-recent" className="m-0 text-[13px] font-semibold">
                {t.recentTitle}
              </h2>
              <button type="button" onClick={onShowHistory} className="text-xs text-link hover:underline">
                {t.recentAll(historyCount)}
              </button>
            </div>
            <ol className={cn(box, 'm-0 list-none p-0')}>
              {recentHistory.map((h) => (
                <li key={h.id} className="flex gap-2.5 border-t border-line-soft px-3.5 py-2.5 first:border-t-0">
                  <span aria-hidden="true" className={cn('mt-[5px] size-2 shrink-0 rounded-full', stageDot(h.to))} />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[13px]">
                      {h.action} · {h.from} → {h.to}
                    </span>
                    <span className="text-xs text-ink-4">
                      {h.user} · {h.at}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      {editing && (
        <BasicEditModal
          contract={contract}
          onClose={() => setEditing(false)}
          onSave={(next, count, ticket) => {
            onSave(next, count, ticket)
            setEditing(false)
          }}
          onGoWorkflow={() => {
            setEditing(false)
            onShowWorkflow()
          }}
        />
      )}
    </div>
  )
}
