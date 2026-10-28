import { useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowRightIcon, ChevronDownIcon, EditIcon, EyeIcon, UndoIcon } from '../../components/icons'
import { cn } from '../../lib/cn'
import { SIGN_CLS, SIGN_METHOD_CODE, STAGE_ORDER } from '../../mocks/contract'
import type { HistoryRow, SignCls, SignMethodCode } from '../../mocks/contract'
import { texts } from '../../texts'
import { DeletedBadge } from './shared'

const t = texts.contract.history

/** 타임라인에 그릴 수 있는 이력. 계약 · 자문 이력이 모두 이 모양을 만족한다 */
export type TimelineRow = {
  id: string
  action: string
  at: string
  deleted: boolean
  comment: string
  from: string
  to: string
  user: string
  stageMove: boolean
  extra?: { signCls?: SignCls; signMethod?: SignMethodCode }
}

export type Item<R extends TimelineRow = HistoryRow> = { type: 'node'; name: string; current: boolean } | { type: 'edge'; row: R; back: boolean }
export type Lane<R extends TimelineRow = HistoryRow> = { back: boolean; items: Item<R>[] }

type Handlers<R extends TimelineRow> = {
  /** 없으면 수정 버튼을 그리지 않는다 */
  onEdit?: (row: R) => void
  /** 없으면 상세 버튼을 그리지 않는다 */
  onDetail?: (row: R) => void
  /** 있으면 이력의 기본 코멘트 줄 대신 이 내용을 그린다 (본문 · 코멘트 토글 등) */
  renderBody?: (row: R) => ReactNode
}

/** 세로선 위의 한 칸. 왼쪽에 일시, 가운데에 선과 점, 오른쪽에 내용 */
function Row({ at, dot, first, last, children }: { at?: string; dot: string; first: boolean; last: boolean; children: ReactNode }) {
  const [date, time] = (at ?? '').split(' ')
  return (
    <li className="grid grid-cols-[84px_22px_minmax(0,1fr)] gap-x-2.5">
      <span className="flex flex-col pt-[7px] text-right text-[11px] leading-tight tabular-nums text-ink-3">
        {at && (
          <>
            <span className="font-semibold text-ink-2">{time}</span>
            <span className="text-ink-4">{date}</span>
          </>
        )}
      </span>
      <span className="relative">
        <span aria-hidden="true" className={cn('absolute left-1/2 w-0.5 -translate-x-1/2 bg-line-strong', first ? 'top-4' : 'top-0', last ? 'h-4' : 'bottom-0')} />
        <span aria-hidden="true" className={cn('absolute left-1/2 top-[9px] -translate-x-1/2 rounded-full', dot)} />
      </span>
      <div className="min-w-0 pb-3">{children}</div>
    </li>
  )
}

function Entry<R extends TimelineRow>({ row, back, onEdit, onDetail, renderBody }: { row: R; back: boolean } & Handlers<R>) {
  const signCls = row.extra?.signCls
  const signMethod = row.extra?.signMethod
  const move = row.stageMove
  return (
    <div
      className={cn(
        'flex flex-wrap items-start gap-x-3 gap-y-2 rounded-xl px-3.5 py-2.5',
        row.deleted
          ? 'border border-danger-line bg-[#fafafb] shadow-[inset_3px_0_0_var(--color-danger)]'
          : back
            ? 'border border-[#ffd3c4] bg-[#ffe6de]'
            : 'border border-line-strong bg-surface shadow-card',
      )}
    >
      <div className="flex min-w-0 flex-1 basis-[260px] flex-col gap-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {back && <UndoIcon size={14} className="shrink-0 text-[#c23b22]" />}
          <span className={cn('text-sm font-bold', back && 'text-[#c23b22]', row.deleted && 'text-ink-4 line-through decoration-danger decoration-[1.5px]')}>{row.action}</span>
          {row.deleted && <DeletedBadge label={t.deleted} />}
          <span className="text-[13px] font-medium text-ink-2">{row.user}</span>
          {move && (
            <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11.5px] font-semibold text-ink-2', back && !row.deleted ? 'bg-white/75' : 'bg-[#f2f2f5]')}>
              {row.from}
              <ArrowRightIcon size={11} strokeWidth={2.6} className="shrink-0" />
              {row.to}
            </span>
          )}
          {signCls !== undefined && (
            <span className="rounded-full bg-[#f2f2f5] px-1.5 py-px text-[10.5px] font-semibold text-ink-2">
              {SIGN_CLS[signCls].label.split(' ')[0]}
              {signMethod !== undefined && ` · ${SIGN_METHOD_CODE[signMethod]}`}
            </span>
          )}
        </span>
        {renderBody ? renderBody(row) : <span className="text-[12.5px] leading-[1.5] text-ink-2">{row.comment}</span>}
      </div>
      {(onEdit || onDetail) && (
      <span className="ml-auto inline-flex shrink-0 items-center gap-2">
        {onDetail && (
          <button type="button" aria-label={texts.contract.historyExtra.detail} title={texts.contract.historyExtra.detail} onClick={() => onDetail(row)} className="inline-flex size-[30px] items-center justify-center rounded-ctl border-[1.5px] border-ink bg-surface text-ink hover:bg-hover">
            <EyeIcon size={15} strokeWidth={2.2} />
          </button>
        )}
        {onEdit && (
          <button type="button" aria-label={t.editLabel(row.action)} title={t.editLabel(row.action)} onClick={() => onEdit(row)} className="inline-flex size-[30px] items-center justify-center rounded-ctl bg-primary text-white hover:brightness-105">
            <EditIcon size={14} />
          </button>
        )}
      </span>
      )}
    </div>
  )
}

function Stage({ name, current }: { name: string; current: boolean }) {
  return (
    <span
      className={cn(
        'box-border inline-flex h-[30px] items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-xs font-semibold',
        current ? 'border-2 border-[#e5a800] bg-[#fff8db] shadow-[0_0_0_3px_rgba(254,198,1,0.22)]' : 'border border-divider bg-[#f2f2f5] text-ink',
      )}
    >
      {name}
      {current && <span className="rounded-full bg-[#fec601] px-1.5 py-px text-[10px] font-bold text-[#3a2e00]">{t.current}</span>}
    </span>
  )
}


/** 진행 줄 하나를 세로 타임라인으로 그린다. 단계는 큰 점, 이력은 작은 점 */
function Timeline<R extends TimelineRow>({ items, handlers }: { items: Item<R>[]; handlers: Handlers<R> }) {
  return (
    <ol className="m-0 flex list-none flex-col p-0">
      {items.map((it, j) => {
        const first = j === 0
        const last = j === items.length - 1
        if (it.type === 'node') {
          return (
            <Row key={j} first={first} last={last} dot={it.current ? 'size-3.5 -mt-[2px] border-2 border-[#e5a800] bg-[#fec601]' : 'size-3 -mt-px border-2 border-ink-3 bg-surface'}>
              <Stage name={it.name} current={it.current} />
            </Row>
          )
        }
        const dot = it.row.deleted ? 'size-2.5 bg-danger' : it.back ? 'size-2.5 bg-[#e0583d]' : 'size-2.5 bg-ink'
        return (
          <Row key={j} at={it.row.at} first={first} last={last} dot={dot}>
            <Entry row={it.row} back={it.back} {...handlers} />
          </Row>
        )
      })}
    </ol>
  )
}

type Props<R extends TimelineRow> = Handlers<R> & {
  lanes: Lane<R>[]
  /** 진행 줄 없이 이력만 시간순으로 보여 줄 때 */
  flatRows?: R[] | null
  /** 역방향 액션을 가리는 단계 순서. 기본은 계약 단계 */
  stageOrder?: Record<string, number>
  /** 마지막 줄이 실제로 진행 중인 줄인지 */
  latestShown: boolean
}

/** 진행 히스토리 (세로 타임라인). 계약 · 자문에서 같이 쓴다 */
export function HistoryTimeline<R extends TimelineRow>({ lanes, flatRows, latestShown, stageOrder = STAGE_ORDER, onEdit, onDetail, renderBody }: Props<R>) {
  const handlers = { onEdit, onDetail, renderBody }
  // 접어 둔 진행 줄 번호
  const [folded, setFolded] = useState<number[]>([])
  const toggle = (i: number) => setFolded((f) => (f.includes(i) ? f.filter((x) => x !== i) : [...f, i]))

  if (flatRows) {
    return <Timeline items={flatRows.map((row): Item<R> => ({ type: 'edge', row, back: (stageOrder[row.to] ?? 0) < (stageOrder[row.from] ?? 0) }))} handlers={handlers} />
  }

  return (
    <ol className="m-0 flex list-none flex-col gap-3 p-0">
      {lanes.map((lane, i) => {
        const last = i === lanes.length - 1 && latestShown
        const open = !folded.includes(i)
        return (
          <li key={i} className={cn('flex min-w-0 flex-col gap-3 rounded-xl px-4 py-3.5', last ? 'border-[1.5px] border-[#e5a800] bg-surface shadow-[0_0_0_3px_rgba(254,198,1,0.16)]' : 'border border-line-soft bg-[#fafafb]')}>
            <button
              type="button"
              aria-expanded={open}
              onClick={() => toggle(i)}
              className={cn('-mx-1 inline-flex w-fit items-center gap-1.5 rounded-md px-1 py-0.5 text-[12.5px] font-bold hover:bg-hover', last ? 'text-[#9a6b00]' : 'text-ink-3')}
            >
              <ChevronDownIcon size={15} strokeWidth={2.4} className={cn('shrink-0 transition-transform', !open && '-rotate-90')} />
              {t.laneLabel(i + 1, last)}
              <span className="font-medium text-ink-4">{t.laneCount(lane.items.filter((it) => it.type === 'edge').length)}</span>
            </button>
            {open && <Timeline items={lane.items} handlers={handlers} />}
          </li>
        )
      })}
    </ol>
  )
}
