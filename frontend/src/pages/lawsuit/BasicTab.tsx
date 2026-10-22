import { useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowRightIcon, EditIcon, LockIcon } from '../../components/icons'
import { Button } from '../../components/ui'
import { cn } from '../../lib/cn'
import { MOCK_COURT_INFO } from '../../mocks/lawsuit'
import type { LawsuitDetail } from '../../mocks/lawsuit'
import { historyHref, historyOf } from '../../mocks/history'
import { texts } from '../../texts'
import { SectionHead } from '../contract/shared'
import { BasicEditModal } from './BasicEditModal'
import { StatusDot } from './shared'

/** 최근 히스토리에 보여 주는 최대 건수 */
const RECENT_LIMIT = 10

const t = texts.lawsuit.basic

/** 시안의 카드: 둥근 흰 박스 */
const box = 'overflow-hidden rounded-card border border-line bg-surface shadow-card'

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[104px_minmax(0,1fr)] items-baseline gap-3 border-b border-line-soft py-[11px] text-[13.5px] last:border-b-0">
      <dt className="text-ink-3">{label}</dt>
      <dd className="m-0 text-ink">{children}</dd>
    </div>
  )
}

type Props = {
  lawsuit: LawsuitDetail
  onSave: (next: LawsuitDetail, changeCount: number, ticket: string) => void
}

/** 기본 정보 탭 */
export function BasicTab({ lawsuit, onSave }: Props) {
  const [editing, setEditing] = useState(false)
  const court = MOCK_COURT_INFO

  // 이 소송의 처리 내역(변경 히스토리). 전체 보기는 검색 조건이 걸린 처리 내역 히스토리 화면으로 연다
  const changes = historyOf('소송', lawsuit.id)
  const recentHistory = changes.slice(0, RECENT_LIMIT)

  return (
    <div className="grid grid-cols-1 items-start gap-7 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-6">
        <section aria-labelledby="lawsuit-basic" className="flex flex-col gap-2">
          <SectionHead id="lawsuit-basic" title={t.title}>
            <Button size="md" icon={<EditIcon size={14} />} onClick={() => setEditing(true)} className="h-9 rounded-ctl px-[18px] font-semibold">
              {t.edit}
            </Button>
          </SectionHead>
          <div className={box}>
            <dl className="m-0 px-5 pb-2 pt-1">
              <Row label={t.fields.id}>
                <span className="font-mono text-[12.5px]">{lawsuit.id}</span> <span className="text-xs text-ink-4">({lawsuit.idPlain})</span>
              </Row>
              <Row label={t.fields.status}>
                <span className="font-medium">
                  <StatusDot status={lawsuit.status} />
                </span>
              </Row>
              <Row label={t.fields.name}>
                <span className="font-medium">{lawsuit.name}</span>
              </Row>
              <Row label={t.fields.suitType}>{lawsuit.suitType}</Row>
              <Row label={t.fields.kind}>{lawsuit.kind}</Row>
              <Row label={t.fields.desc}>
                <span className="whitespace-pre-wrap leading-[1.6] text-ink-2">{lawsuit.desc || t.emptyDesc}</span>
              </Row>
              <Row label={t.fields.amount}>
                <span className="tabular-nums">{texts.lawsuit.won(lawsuit.amount)}</span>
              </Row>
              <Row label={t.fields.startDate}>
                <span className="tabular-nums">{lawsuit.startDate || t.emptyDesc}</span>
              </Row>
              <Row label={t.fields.endDate}>
                <span className="tabular-nums">{lawsuit.endDate || t.emptyDesc}</span>
              </Row>
              <Row label={t.fields.migrated}>{t.migrated[String(lawsuit.migrated) as 'true' | 'false']}</Row>
              <Row label={t.fields.deleted}>{lawsuit.deleted ? t.deletedYes : t.deletedNo}</Row>
              <Row label={t.fields.updatedAt}>
                <span className="tabular-nums">{lawsuit.updatedAt}</span>
              </Row>
            </dl>
          </div>
        </section>

        <section aria-labelledby="lawsuit-court" className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-3 px-3">
            <span className="flex items-baseline gap-2">
              <h2 id="lawsuit-court" className="m-0 text-[13px] font-semibold">
                {t.courtTitle}
              </h2>
              <span className="text-xs text-ink-4">{t.courtBadge}</span>
            </span>
            <span className="flex flex-wrap items-center gap-2.5 text-xs text-ink-4">
              <span className="inline-flex items-center gap-1.5 font-medium text-success-ink">
                <span aria-hidden="true" className="size-2 rounded-full bg-success" />
                {t.linked}
              </span>
              <span className="tabular-nums">{t.syncedAt(court.syncedAt)}</span>
              <span aria-hidden="true" className="h-3 w-px bg-line-strong" />
              <span className="inline-flex items-center gap-1">
                <LockIcon size={11} />
                {t.readOnly}
              </span>
            </span>
          </div>
          <div className={box}>
            <dl className="m-0 grid grid-cols-1 gap-x-8 px-5 pb-1 pt-1 sm:grid-cols-2">
              {court.rows.map((r) => (
                <div key={r.label} className="grid grid-cols-[88px_minmax(0,1fr)] items-baseline gap-3 border-b border-line-soft py-2.5 text-[13px]">
                  <dt className="text-ink-4">{r.label}</dt>
                  <dd className={cn('m-0 text-ink-2', r.label === '사건번호' && 'font-mono text-[12.5px]')}>{r.value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#fafafb] px-5 py-3 text-xs text-ink-4">
              <span>{t.courtNote}</span>
              <a href="#scourt" className="inline-flex items-center gap-1 font-medium text-link hover:underline">
                {t.courtLink}
                <ArrowRightIcon size={12} />
              </a>
            </div>
          </div>
        </section>
      </div>

      <section aria-labelledby="lawsuit-recent" className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between px-3">
          <h2 id="lawsuit-recent" className="m-0 text-[13px] font-semibold">
            {t.recentTitle}
          </h2>
          <a href={historyHref('소송', lawsuit.id)} className="text-xs text-link hover:underline">
            {t.recentAll(changes.length)}
          </a>
        </div>
        <ol className={cn(box, 'm-0 list-none p-0')}>
          {recentHistory.map((h) => (
            <li key={h.id} className="flex gap-2.5 border-t border-line-soft px-3.5 py-2.5 first:border-t-0">
              <span aria-hidden="true" className="mt-[5px] size-2 shrink-0 rounded-full bg-primary" />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[13px]">
                  {h.type} · {h.target}
                </span>
                <span className="text-xs text-ink-4">
                  {h.user} · {h.at}
                </span>
              </span>
            </li>
          ))}
          {recentHistory.length === 0 && <li className="px-3.5 py-5 text-center text-[13px] text-ink-4">{t.recentEmpty}</li>}
        </ol>
      </section>

      {editing && (
        <BasicEditModal
          lawsuit={lawsuit}
          onClose={() => setEditing(false)}
          onSave={(next, count, ticket) => {
            onSave(next, count, ticket)
            setEditing(false)
          }}
        />
      )}
    </div>
  )
}
