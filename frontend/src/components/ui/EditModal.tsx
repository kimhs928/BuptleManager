import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useModalFocus } from '../../hooks/useModalFocus'
import { useNow } from '../../hooks/useNow'
import { cn } from '../../lib/cn'
import { formatDateTime, formatDateTimeSec } from '../../lib/date'
import { texts } from '../../texts'
import { CloseIcon } from '../icons'
import { Button } from './Button'
import { ChangeSummary } from './ChangeSummary'
import type { Change } from './ChangeSummary'
import { Field, TextInput } from './Field'

const t = texts.common.editModal

export type AuditInfo = {
  actor: string
  /** 모달을 연 시각. 화면에는 흘러가는 현재 시각을 보여 주므로 쓰지 않는다 */
  at?: string
  company: string
  action: string
}

/** 흘러가는 현재 시각. 이 부분만 다시 그려서 입력 중인 내용에 영향을 주지 않는다 */
function LiveClock() {
  const now = useNow()
  return <span className="tabular-nums">{formatDateTimeSec(now)}</span>
}

type Props = {
  title: string
  description?: string
  changes: Change[]
  audit: AuditInfo
  ticket: string
  onTicketChange: (v: string) => void
  reason: string
  onReasonChange: (v: string) => void
  onClose: () => void
  /** 실행을 누른 시각('YYYY-MM-DD HH:mm')과 작업 요청자를 넘겨 준다. 히스토리에는 이 값으로 기록한다 */
  onSave: (at: string, requester: string) => void
  saving?: boolean
  /** 저장 버튼 문구 (기본: 저장 · 히스토리 기록) */
  saveLabel?: string
  /** 변경 항목·티켓·사유 외에 저장 조건이 더 있을 때 (기본 true) */
  canSubmit?: boolean
  /** 오른쪽 목록 제목과 비었을 때 문구 (기본: 변경 항목) */
  changesTitle?: string
  /** false면 오른쪽에 변경 항목 목록을 감춘다 (추출처럼 값을 바꾸지 않는 작업) */
  showChanges?: boolean
  changesEmpty?: string
  children: ReactNode
}

/** 수정 모달 공통 틀 (좌: 입력, 우: 변경 요약·티켓·사유·기록 정보) */
export function EditModal({
  title,
  description = t.defaultDescription,
  changes,
  audit,
  ticket,
  onTicketChange,
  reason,
  onReasonChange,
  onClose,
  onSave,
  saving,
  saveLabel = t.save,
  canSubmit = true,
  changesTitle,
  showChanges = true,
  changesEmpty,
  children,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [requester, setRequester] = useState('')
  useModalFocus(dialogRef, onClose)

  const canSave = canSubmit && (!showChanges || changes.length > 0) && ticket.trim() !== '' && requester.trim() !== '' && reason.trim() !== ''

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-navy/55 p-6">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
        className="flex max-h-full w-full max-w-[1120px] flex-col overflow-hidden rounded-[18px] bg-surface shadow-modal"
      >
        <div className="flex items-center gap-3.5 border-b border-line-soft px-6 py-[18px]">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h2 id="edit-modal-title" className="m-0 text-[17px] font-semibold">
              {title}
            </h2>
            <span className="text-[13px] text-ink-3">{description}</span>
          </div>
          <button type="button" aria-label={texts.common.action.close} onClick={onClose} className="flex size-8 items-center justify-center rounded-ctl text-ink-4 hover:bg-fill">
            <CloseIcon size={16} strokeWidth={2.2} />
          </button>
        </div>

        <div className="grid items-start gap-5 overflow-y-auto px-6 py-5 [grid-template-columns:minmax(0,1fr)_340px]">
          <div className="flex min-w-0 flex-col gap-3">{children}</div>

          <aside aria-label={t.asideLabel} className="sticky top-0 flex flex-col gap-4 self-stretch border-l-2 border-line pl-5">
            {showChanges && <ChangeSummary changes={changes} title={changesTitle} emptyText={changesEmpty} />}
            <Field label={t.ticket.label} required>
              {(id) => <TextInput id={id} value={ticket} onChange={(e) => onTicketChange(e.target.value)} placeholder={t.ticket.placeholder} />}
            </Field>
            <Field label={t.requester.label} required>
              {(id) => <TextInput id={id} value={requester} onChange={(e) => setRequester(e.target.value)} placeholder={t.requester.placeholder} autoComplete="off" />}
            </Field>
            <Field label={t.reason.label} required>
              {(id) => <TextInput id={id} value={reason} onChange={(e) => onReasonChange(e.target.value)} placeholder={t.reason.placeholder} />}
            </Field>
            <dl className="m-0 grid grid-cols-2 gap-2.5 rounded-xl border border-line-soft bg-[#f5f5f7] p-3.5 text-[13px]">
              {(
                [
                  [t.audit.actor, audit.actor],
                  [t.audit.at, <LiveClock key="clock" />],
                  [t.audit.company, audit.company],
                  [t.audit.action, audit.action],
                ] as const
              ).map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5">
                  <dt className="text-[11px] text-ink-4">{k}</dt>
                  <dd className="m-0">{v}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        <div className="flex justify-end gap-2.5 border-t border-line-soft bg-bg/60 px-6 py-3.5">
          <Button variant="secondary" onClick={onClose} className="h-[42px] px-[18px] text-sm">
            {texts.common.action.cancel}
          </Button>
          <Button variant="primary" onClick={() => onSave(formatDateTime(), requester.trim())} loading={saving} disabled={!canSave} className="h-[42px] px-5 text-sm font-semibold">
            {saveLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

/** 필드 묶음 카드 */
export function FieldGroup({ title, children, className, columns = 2 }: { title: ReactNode; children: ReactNode; className?: string; columns?: 1 | 2 }) {
  return (
    <section className={cn('flex flex-col gap-3 rounded-xl border border-ink-2 bg-surface p-4', className)}>
      <span className="text-xs font-bold tracking-wide text-ink">{title}</span>
      <div className={cn('grid gap-3', columns === 2 ? 'grid-cols-2' : 'grid-cols-1')}>{children}</div>
    </section>
  )
}
