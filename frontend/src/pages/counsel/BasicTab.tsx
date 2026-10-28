import { useState } from 'react'
import type { ReactNode } from 'react'
import { EditIcon, LockIcon } from '../../components/icons'
import { Button } from '../../components/ui'
import { cn } from '../../lib/cn'
import type { CounselDetail } from '../../mocks/counsel'
import { historyHref, historyOf } from '../../mocks/history'
import { texts } from '../../texts'
import { SectionHead } from '../contract/shared'
import { BasicEditModal } from './BasicEditModal'
import { StatusDot } from './shared'

/** 최근 히스토리에 보여 주는 최대 건수 */
const RECENT_LIMIT = 10

const t = texts.counsel.basic

/** 시안의 카드: 둥근 흰 박스 */
const box = 'overflow-hidden rounded-card border border-line bg-surface shadow-card'

function Row({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={cn('grid grid-cols-[104px_minmax(0,1fr)] items-baseline gap-3 border-b border-line-soft py-[11px] text-[13.5px]', wide && 'col-span-full')}>
      <dt className="text-ink-3">{label}</dt>
      <dd className="m-0 text-ink">{children}</dd>
    </div>
  )
}

type Props = {
  counsel: CounselDetail
  onSave: (next: CounselDetail, changeCount: number, ticket: string) => void
}

/** 기본 정보 탭 */
export function BasicTab({ counsel, onSave }: Props) {
  const [editing, setEditing] = useState(false)

  // 이 자문의 처리 내역(변경 히스토리). 전체 보기는 검색 조건이 걸린 처리 내역 히스토리 화면으로 연다
  const changes = historyOf('자문', counsel.id)
  const recentHistory = changes.slice(0, RECENT_LIMIT)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-start gap-3">
        <Button size="md" icon={<EditIcon size={14} />} onClick={() => setEditing(true)} className="h-9 rounded-ctl px-[18px] font-semibold">
          {t.edit}
        </Button>
        <span className="text-xs text-ink-4">{t.editHint}</span>
      </div>

      <div className="grid grid-cols-1 items-start gap-7 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <section aria-labelledby="counsel-basic" className="flex flex-col gap-2">
        <SectionHead id="counsel-basic" title={t.title} />
        <div className={box}>
          <dl className="m-0 grid grid-cols-1 gap-x-8 px-5 pb-2 pt-1 sm:grid-cols-2 [&>div:last-child]:border-b-0">
            <Row label={t.fields.id}>
              <span className="font-mono text-[12.5px]">{counsel.id}</span> <span className="text-xs text-ink-4">({counsel.idPlain})</span>
            </Row>
            <Row label={t.fields.status}>
              <span className="font-medium">
                <StatusDot status={counsel.status} />
              </span>
            </Row>
            <Row label={t.fields.name} wide>
              <span className="font-medium">{counsel.name}</span>
            </Row>
            <Row label={t.fields.createdAt}>
              <span className="tabular-nums">{counsel.createdAt}</span>
            </Row>
            <Row label={t.fields.updatedAt}>
              <span className="tabular-nums">{counsel.updatedAt}</span>
            </Row>
            <Row label={t.fields.deleted}>{counsel.deleted ? t.deletedYes : t.deletedNo}</Row>
            <Row label={t.fields.deletedAt}>
              <span className={cn('tabular-nums', !counsel.deletedAt && 'text-ink-4')}>{counsel.deletedAt || '-'}</span>
            </Row>
            <Row label={t.fields.managed}>
              {counsel.managed ? t.managedYes : t.managedNo} <span className="text-xs text-ink-4">(ismanaged)</span>
            </Row>
            <Row label={t.fields.counselType}>{t.counselTypes[counsel.counselType]}</Row>
            <Row label={t.fields.showRange}>{t.showRanges[counsel.showRangeType]}</Row>
            <Row label={t.fields.migrated}>
              <span className={cn(!counsel.migrated && 'text-ink-4')}>{counsel.migrated ? t.migratedYes : t.migratedNo}</span>
            </Row>
            <Row label={t.fields.projects} wide>
              {counsel.projects.length > 0 ? (
                <span className="flex flex-wrap gap-1.5">
                  {counsel.projects.map((p) => (
                    <span key={p} className="inline-flex h-[22px] items-center rounded-md bg-[#f2f2f5] px-2 text-xs font-medium leading-none text-ink-2">
                      {p}
                    </span>
                  ))}
                </span>
              ) : (
                <span className="text-ink-4">-</span>
              )}
            </Row>
          </dl>
        </div>
      </section>

      <div className="flex flex-col gap-6">
        <section aria-labelledby="counsel-category" className="flex flex-col gap-1.5">
          <SectionHead id="counsel-category" title={t.categoryTitle}>
            <span className="inline-flex items-center gap-[5px] text-xs text-ink-4">
              <LockIcon size={12} />
              <span>{t.readOnly}</span>
            </span>
          </SectionHead>
          <dl className={cn(box, 'm-0')}>
            <div className="flex flex-col gap-0.5 px-3.5 py-2.5">
              <dt className="text-xs text-ink-4">{t.category}</dt>
              <dd className="m-0 text-[13px]">
                <span className="text-ink-3">{counsel.categoryParent}</span>{' '}
                <span aria-label={t.subCategory} className="text-ink-5">
                  ›
                </span>{' '}
                {counsel.category}
              </dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="counsel-recent" className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between px-3">
            <h2 id="counsel-recent" className="m-0 text-[13px] font-semibold">
              {t.recentTitle}
            </h2>
            <a href={historyHref('자문', counsel.id)} className="text-xs text-link hover:underline">
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
      </div>
      </div>

      {editing && (
        <BasicEditModal
          counsel={counsel}
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
