import { useEffect, useRef, useState } from 'react'
import { ArrowRightIcon, CheckIcon, EditIcon, EyeIcon, LinkIcon, UndoIcon } from '../../components/icons'
import { cn } from '../../lib/cn'
import { STAGE_ORDER } from '../../mocks/contract'
import type { ContractEmail, HistoryRow } from '../../mocks/contract'
import { texts } from '../../texts'
import { EmailViewModal } from './EmailViewModal'
import { HistoryEditModal } from './HistoryEditModal'
import { DeletedBadge } from './shared'

const t = texts.contract.history

/** 시안의 카드: 둥근 흰 박스 */
const box = 'rounded-card border border-line bg-surface shadow-card'

type Item = { type: 'node'; name: string; current: boolean } | { type: 'edge'; row: HistoryRow; back: boolean }
type Lane = { back: boolean; items: Item[] }

/** 시간순 히스토리를 진행 줄로 나눈다. 단계가 되돌아가면 새 줄에서 다시 시작한다 */
function buildLanes(history: HistoryRow[]): Lane[] {
  const sorted = [...history].sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0))
  const lanes: Lane[] = []
  let lane: Lane | null = null
  for (const row of sorted) {
    const back = (STAGE_ORDER[row.to] ?? 0) < (STAGE_ORDER[row.from] ?? 0)
    if (!lane || back) {
      lane = { back, items: [] }
      lanes.push(lane)
      if (!back) lane.items.push({ type: 'node', name: row.from, current: false })
    }
    lane.items.push({ type: 'edge', row, back })
    lane.items.push({ type: 'node', name: row.to, current: false })
  }
  const last = lanes.at(-1)?.items.at(-1)
  if (last?.type === 'node') last.current = true
  return lanes
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true" className={cn('h-2.5 w-3.5', className)} />
      {label}
    </span>
  )
}

function HistoryCard({ row, back, onEdit }: { row: HistoryRow; back: boolean; onEdit: () => void }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1">
      <ArrowRightIcon size={16} className="shrink-0 text-ink-5" />
      <span
        className={cn(
          'flex w-[200px] shrink-0 flex-col gap-1.5 rounded-[10px] px-3 py-2.5',
          row.deleted ? 'border border-danger-line bg-[#fafafb] shadow-[inset_3px_0_0_var(--color-danger)]' : back ? 'border border-[#ffd3c4] bg-[#ffe6de]' : 'border border-divider bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
        )}
      >
        <span className="flex items-center justify-between gap-1.5">
          <span className={cn('flex min-w-0 items-center gap-[5px] text-xs font-semibold', back ? 'text-[#c23b22]' : 'text-ink')}>
            {back && <UndoIcon size={13} className="shrink-0" />}
            <span className={cn('truncate', row.deleted && 'text-ink-4 line-through decoration-danger decoration-[1.5px]')}>{row.action}</span>
            {row.deleted && <DeletedBadge label={t.deleted} />}
          </span>
          <button type="button" aria-label={t.editLabel(row.action)} title={t.editLabel(row.action)} onClick={onEdit} className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-ctl bg-primary text-white hover:brightness-105">
            <EditIcon size={14} />
          </button>
        </span>
        <span className="whitespace-nowrap text-[11px] tabular-nums text-ink-3">
          {row.user} · {row.at}
        </span>
        <span className={cn('flex min-w-0 items-center gap-[5px] rounded-md px-2 py-1 text-[11.5px] font-semibold text-ink-2', back && !row.deleted ? 'bg-white/75' : 'bg-[#f2f2f5]')}>
          <span className="truncate">{row.from}</span>
          <ArrowRightIcon size={12} strokeWidth={2.6} className="shrink-0" />
          <span className="truncate">{row.to}</span>
        </span>
        <span className="flex flex-col gap-0.5 border-t border-line-soft pt-1.5">
          <span className="text-[10px] font-semibold text-ink-4">{t.comment}</span>
          <span className="text-[11px] leading-[1.45] text-ink-2">{row.comment}</span>
        </span>
      </span>
      <ArrowRightIcon size={16} className="shrink-0 text-ink-5" />
    </span>
  )
}

const th = 'whitespace-nowrap border-b border-line-soft px-3.5 py-2.5 text-left text-xs font-medium text-ink-4'
const td = 'px-3.5 py-[11px] whitespace-nowrap'
const smallBtn = 'inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-[7px] border px-3 text-xs font-medium'

type Props = {
  history: HistoryRow[]
  emails: ContractEmail[]
  members: string[]
  onSaveRow: (next: HistoryRow, ticket: string) => void
}

/** 계약 진행 히스토리 · 이메일 발송 내역 */
export function HistoryTab({ history, emails, members, onSaveRow }: Props) {
  const [editing, setEditing] = useState<HistoryRow | null>(null)
  const [viewing, setViewing] = useState<ContractEmail | null>(null)
  const [copiedId, setCopiedId] = useState('')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const lanes = buildLanes(history)

  const copy = async (e: ContractEmail) => {
    try {
      await navigator.clipboard.writeText(e.link)
    } catch {
      // 클립보드 권한이 없으면 복사됨 표시를 하지 않는다
      return
    }
    setCopiedId(e.id)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopiedId(''), 1600)
  }

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="history-title" className="flex flex-col gap-2">
        <div className="px-3">
          <h2 id="history-title" className="m-0 text-[13px] font-semibold">
            {t.title}
          </h2>
        </div>
        <div className={cn(box, 'flex flex-col gap-3.5 px-[22px] py-5')}>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11.5px] text-ink-3">
            <Legend className="rounded-[3px] border border-line-strong bg-surface" label={t.legend.forward} />
            <Legend className="rounded-[3px] border border-[#ffd3c4] bg-[#ffe6de]" label={t.legend.backward} />
            <Legend className="rounded-[3px] border border-danger-line bg-[#fafafb] shadow-[inset_2px_0_0_var(--color-danger)]" label={t.legend.deleted} />
            <Legend className="rounded-full border-2 border-[#e5a800] bg-[#fff8db]" label={t.legend.current} />
          </div>

          <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
            {lanes.map((lane, i) => {
              const last = i === lanes.length - 1
              return (
                <li key={i} className={cn('flex min-w-0 flex-col gap-2.5 rounded-xl px-3.5 py-3', last ? 'border-[1.5px] border-[#e5a800] bg-surface shadow-[0_0_0_3px_rgba(254,198,1,0.16)]' : 'border border-line-soft bg-[#fafafb]')}>
                  <span className={cn('text-[11.5px] font-semibold', last ? 'text-[#9a6b00]' : 'text-ink-3')}>{t.laneLabel(i + 1, last)}</span>
                  <div className="flex min-w-0 flex-nowrap items-center gap-1 overflow-x-auto pb-1.5">
                    {lane.items.map((it, j) =>
                      it.type === 'node' ? (
                        <span
                          key={j}
                          className={cn(
                            'box-border inline-flex h-[30px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-xs font-semibold',
                            it.current ? 'border-2 border-[#e5a800] bg-[#fff8db] shadow-[0_0_0_3px_rgba(254,198,1,0.22)]' : 'border border-divider bg-[#f2f2f5] text-ink',
                          )}
                        >
                          {it.name}
                          {it.current && <span className="rounded-full bg-[#fec601] px-1.5 py-px text-[10px] font-bold text-[#3a2e00]">{t.current}</span>}
                        </span>
                      ) : (
                        <HistoryCard key={j} row={it.row} back={it.back} onEdit={() => setEditing(it.row)} />
                      ),
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      <section aria-labelledby="email-title" className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3 px-3">
          <h2 id="email-title" className="m-0 text-[13px] font-semibold">
            {t.emailTitle}
          </h2>
          <span className="text-xs text-ink-4">{t.emailCount(emails.length)}</span>
        </div>
        <div className={cn(box, 'overflow-hidden')}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] border-collapse text-[13px]">
              <thead>
                <tr>
                  <th scope="col" className={cn(th, 'pl-5')}>{t.emailColumns.createdAt}</th>
                  <th scope="col" className={th}>{t.emailColumns.updatedAt}</th>
                  <th scope="col" className={th}>{t.emailColumns.sender}</th>
                  <th scope="col" className={th}>{t.emailColumns.receiver}</th>
                  <th scope="col" className={th}>{t.emailColumns.subject}</th>
                  <th scope="col" className={th}>{t.emailColumns.link}</th>
                  <th scope="col" className={th}>{t.emailColumns.body}</th>
                  <th scope="col" className={cn(th, 'pr-5')}>{t.emailColumns.contractId}</th>
                </tr>
              </thead>
              <tbody>
                {emails.map((m) => (
                  <tr key={m.id} className="border-t border-line-soft bg-surface hover:bg-hover">
                    <td className={cn(td, 'pl-5 tabular-nums text-ink-2')}>{m.createdAt}</td>
                    <td className={cn(td, 'tabular-nums text-ink-2')}>{m.updatedAt}</td>
                    <td className={td}>
                      <span className="flex flex-col gap-0.5 leading-tight">
                        <span className="font-medium">{m.sender}</span>
                        <span className="text-[11.5px] text-ink-4">{m.senderMail}</span>
                      </span>
                    </td>
                    <td className={td}>
                      <span className="flex flex-col gap-0.5 leading-tight">
                        <span className="font-medium">{m.receiver}</span>
                        <span className="text-[11.5px] text-ink-4">{m.receiverMail}</span>
                      </span>
                    </td>
                    <td className={cn(td, 'min-w-[240px] whitespace-normal font-medium')}>{m.subject}</td>
                    <td className={td}>
                      <button
                        type="button"
                        title={m.link}
                        onClick={() => void copy(m)}
                        className={cn(smallBtn, copiedId === m.id ? 'border-success-line bg-success-soft text-success-ink' : 'border-line-strong bg-surface text-ink')}
                      >
                        {copiedId === m.id ? <CheckIcon size={13} /> : <LinkIcon size={13} />}
                        {copiedId === m.id ? t.copied : t.copyLink}
                      </button>
                    </td>
                    <td className={td}>
                      <button type="button" onClick={() => setViewing(m)} className={cn(smallBtn, 'border-line-strong bg-surface text-ink hover:bg-hover')}>
                        <EyeIcon size={13} />
                        {t.viewBody}
                      </button>
                    </td>
                    <td className={cn(td, 'pr-5')}>
                      <code className="rounded-md bg-[#ebebf0] px-[7px] py-0.5 font-mono text-xs text-ink-2">{m.contractId}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {editing && (
        <HistoryEditModal
          row={editing}
          users={members}
          onClose={() => setEditing(null)}
          onSave={(next, ticket) => {
            onSaveRow(next, ticket)
            setEditing(null)
          }}
        />
      )}
      {viewing && <EmailViewModal email={viewing} copied={copiedId === viewing.id} onCopy={() => void copy(viewing)} onClose={() => setViewing(null)} />}
    </div>
  )
}
