import { useState } from 'react'
import type { ReactNode } from 'react'
import { ExpandIcon, LinkIcon } from '../../components/icons'
import { ViewModal } from '../../components/ui'
import { cn } from '../../lib/cn'
import { HISTORY_EMPTY } from '../../mocks/history'
import type { HistoryDiffKind, HistoryRecord } from '../../mocks/history'
import { texts } from '../../texts'
import { TypeChip } from './shared'

const t = texts.history.detail

const kindTone: Record<HistoryDiffKind, string> = {
  변경: 'border border-divider bg-[#f2f2f5] text-ink-2',
  추가: 'border border-success-line bg-success-soft text-success-ink',
  삭제: 'border border-danger-line bg-danger-soft text-danger-ink',
}

function Info({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-0.5', wide && 'col-span-2')}>
      <dt className="text-[11px] text-ink-4">{label}</dt>
      <dd className="m-0 break-words text-[13px] font-medium">{children}</dd>
    </div>
  )
}

/** 값이 없으면 "없음"으로 흐리게 보여 준다 */
function Value({ value }: { value: string }) {
  return value === HISTORY_EMPTY ? <span className="text-ink-5">{t.empty}</span> : <>{value}</>
}

/** Zendesk 채팅 내역. 길어지면 영역 안에서 스크롤하고, 크게 보기로 채팅만 따로 볼 수 있다 */
function ChatPanel({ record, large }: { record: HistoryRecord; large?: boolean }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface px-4 py-3.5">
      <dl className="m-0 flex flex-wrap gap-x-6 gap-y-1 border-b border-line-soft pb-3 text-[12px]">
        <span className="inline-flex items-center gap-1.5">
          <dt className="text-ink-4">{t.zendesk.id}</dt>
          <dd className="m-0 font-mono font-medium">{record.zendeskId}</dd>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <dt className="text-ink-4">{t.zendesk.status}</dt>
          <dd className="m-0 inline-flex items-center gap-1.5 font-medium">
            <span aria-hidden="true" className="size-[7px] rounded-full bg-success" />
            {t.zendesk.statusValue}
          </dd>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <dt className="text-ink-4">{t.zendesk.channel}</dt>
          <dd className="m-0 font-medium">{t.zendesk.channelValue}</dd>
        </span>
      </dl>
      {/* 내용이 많아도 창이 끝없이 길어지지 않도록 높이를 제한한다 */}
      <ul tabIndex={0} aria-label={t.chatTitle} className={cn('m-0 flex list-none flex-col gap-3 overflow-y-auto p-0 pr-1', large ? 'max-h-none' : 'max-h-[320px]')}>
        {record.chat.map((c, i) => {
          const staff = c.from === 'staff'
          return (
            <li key={i} className={cn('flex flex-col gap-[3px]', large ? 'max-w-[70%]' : 'max-w-[78%]', staff ? 'items-end self-end' : 'items-start self-start')}>
              <span className="text-[11px] text-ink-4">
                <b className="font-semibold text-ink-2">{c.name}</b> · {c.role} · {c.at}
              </span>
              <span className={cn('rounded-xl px-3 py-2 leading-normal', large ? 'text-sm' : 'text-[13px]', staff ? 'bg-primary text-white' : 'bg-[#e9e9eb] text-ink')}>{c.text}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

type Props = {
  record: HistoryRecord
  onClose: () => void
}

/** 처리 내역 상세 (항목별 원래 데이터 · 수정한 데이터 · 전체 비교 · Zendesk 채팅 내역) */
export function HistoryDetailModal({ record, onClose }: Props) {
  const [expanded, setExpanded] = useState(false)
  const count = (kind: HistoryDiffKind) => record.diffs.filter((d) => d.kind === kind).length
  const changedLabels = new Set(record.diffs.map((d) => d.label))

  // 크게 보기: 채팅만 담은 창으로 바꿔 보여 주고, 닫으면 처리 내역 상세로 돌아간다
  if (expanded) {
    return (
      <ViewModal wide title={t.chatTitle} description={`${record.ticket} · ${record.zendeskId}`} onClose={() => setExpanded(false)}>
        <ChatPanel record={record} large />
      </ViewModal>
    )
  }

  return (
    <ViewModal
      wide
      title={t.title}
      description={`${record.func} · ${record.type} · ${record.ticket}`}
      onClose={onClose}
      actions={
        <a href="#zendesk" className="inline-flex h-[42px] items-center gap-1.5 rounded-ctl border border-line-strong bg-surface px-[18px] text-sm font-medium text-ink hover:bg-hover">
          {t.openZendesk}
          <LinkIcon size={13} />
        </a>
      }
    >
      <section aria-label={t.infoTitle} className="flex flex-col gap-2">
        <h3 className="m-0 text-xs font-semibold text-ink-3">{t.infoTitle}</h3>
        <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-line bg-surface px-4 py-3.5 sm:grid-cols-3">
          <Info label={t.fields.ticket}>
            <span className="font-mono text-[12.5px]">{record.ticket}</span>
          </Info>
          <Info label={t.fields.at}>
            <span className="tabular-nums">{record.at}</span>
          </Info>
          <Info label={t.fields.user}>{record.user}</Info>
          <Info label={t.fields.customer}>{record.customerName}</Info>
          <Info label={t.fields.func}>{record.func}</Info>
          <Info label={t.fields.type}>
            <TypeChip type={record.type} />
          </Info>
          <Info label={t.fields.target} wide>
            {record.target}
          </Info>
          <Info label={t.fields.reason} wide>
            {record.reason}
          </Info>
        </dl>
      </section>

      <section aria-label={t.diffTitle(record.diffs.length)} className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-line-soft px-3.5 py-2.5">
          <h3 className="m-0 text-xs font-semibold">{t.diffTitle(record.diffs.length)}</h3>
          <span className="flex flex-wrap items-center gap-1.5 text-[11px] text-ink-3">
            {(['변경', '추가', '삭제'] as const).map((k) => (
              <span key={k} className={cn('inline-flex items-center gap-1 rounded-full px-2 py-px font-semibold', kindTone[k], count(k) === 0 && 'opacity-40')}>
                {t.kinds[k]} {count(k)}
              </span>
            ))}
          </span>
        </div>
        <div className="grid grid-cols-[170px_minmax(0,1fr)_minmax(0,1fr)_56px] gap-x-3 border-b border-line-soft bg-[#fafafb] px-3.5 py-[7px] text-[11px] font-medium text-ink-4">
          <span>{t.diffColumns.label}</span>
          <span>{t.diffColumns.before}</span>
          <span>{t.diffColumns.after}</span>
          <span>{t.diffColumns.kind}</span>
        </div>
        <ul className="m-0 list-none p-0">
          {record.diffs.map((d, i) => (
            <li key={d.label} className={cn('grid grid-cols-[170px_minmax(0,1fr)_minmax(0,1fr)_56px] items-start gap-x-3 px-3.5 py-2.5 text-[12.5px] leading-[1.5]', i > 0 && 'border-t border-line-soft')}>
              <span className="break-words font-medium text-ink-2">{d.label}</span>
              <span className={cn('break-words rounded-md px-2 py-1', d.before === HISTORY_EMPTY ? 'bg-[#f2f2f5]' : 'bg-danger-soft text-danger-ink')}>
                <Value value={d.before} />
              </span>
              <span className={cn('break-words rounded-md px-2 py-1 font-medium', d.after === HISTORY_EMPTY ? 'bg-[#f2f2f5] font-normal' : 'bg-success-soft text-success-ink')}>
                <Value value={d.after} />
              </span>
              <span className={cn('inline-flex h-5 items-center justify-center rounded-full px-1.5 text-[10.5px] font-semibold', kindTone[d.kind])}>{t.kinds[d.kind]}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label={t.compareTitle} className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="m-0 text-xs font-semibold text-ink-3">{t.compareTitle}</h3>
          <span className="text-[11px] text-ink-4">{t.compareHint}</span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {(['before', 'after'] as const).map((side) => (
            <div key={side} className="overflow-hidden rounded-xl border border-line bg-surface">
              <div className={cn('border-b border-line-soft px-3.5 py-2 text-xs font-semibold', side === 'before' ? 'bg-danger-soft text-danger-ink' : 'bg-success-soft text-success-ink')}>
                {side === 'before' ? t.compareBefore : t.compareAfter}
              </div>
              <dl className="m-0 flex flex-col">
                {record.keep.map((f) => (
                  <div key={f.label} className="grid grid-cols-[130px_minmax(0,1fr)] gap-x-3 border-t border-line-soft px-3.5 py-2 text-[12.5px] first:border-t-0">
                    <dt className="text-ink-4">{f.label}</dt>
                    <dd className="m-0 break-words text-ink-2">{f.value}</dd>
                  </div>
                ))}
                {record.diffs.map((d) => {
                  const value = side === 'before' ? d.before : d.after
                  return (
                    <div
                      key={d.label}
                      className={cn(
                        'grid grid-cols-[130px_minmax(0,1fr)] gap-x-3 border-t border-line-soft px-3.5 py-2 text-[12.5px] first:border-t-0',
                        side === 'before' ? 'bg-danger-soft/50' : 'bg-success-soft/50',
                      )}
                    >
                      <dt className="font-medium text-ink-2">{d.label}</dt>
                      <dd className={cn('m-0 break-words font-medium', side === 'before' ? 'text-danger-ink' : 'text-success-ink')}>
                        <Value value={value} />
                      </dd>
                    </div>
                  )
                })}
              </dl>
            </div>
          ))}
        </div>
        <span className="sr-only">{[...changedLabels].join(', ')}</span>
      </section>

      <section aria-label={t.chatTitle} className="mt-4 flex flex-col gap-2 border-t border-line-soft pt-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="m-0 text-xs font-semibold text-ink-3">{t.chatTitle}</h3>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex h-7 items-center gap-1.5 rounded-[7px] border border-line-strong bg-surface px-2.5 text-xs font-medium text-ink hover:bg-hover"
          >
            <ExpandIcon size={12} />
            {t.chatExpand}
          </button>
        </div>
        <ChatPanel record={record} />
      </section>
    </ViewModal>
  )
}
