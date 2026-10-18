import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Button } from './Button'
import { ChangeSummary } from './ChangeSummary'
import type { Change } from './ChangeSummary'
import { Field, TextInput } from './Field'

export type AuditInfo = { actor: string; at: string; company: string; action: string }

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
  onSave: () => void
  saving?: boolean
  children: ReactNode
}

/**
 * 모든 수정 모달의 공통 틀.
 * 좌: 입력 영역(children) / 우: 변경 요약 · 티켓 · 사유 · 자동 기록 정보(340px 고정).
 * 요구사항: 수정 시 변경 전/후 저장, 티켓 번호 필수, 변경 내역 기록.
 */
export function EditModal({
  title,
  description = '변경 전/후 값이 히스토리에 함께 저장됩니다.',
  changes,
  audit,
  ticket,
  onTicketChange,
  reason,
  onReasonChange,
  onClose,
  onSave,
  saving,
  children,
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const canSave = changes.length > 0 && ticket.trim() !== '' && reason.trim() !== ''

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-navy/55 p-6">
      <div
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
          <button type="button" aria-label="닫기" onClick={onClose} className="flex size-8 items-center justify-center rounded-ctl text-ink-4 hover:bg-fill">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="grid items-start gap-5 overflow-y-auto px-6 py-5 [grid-template-columns:minmax(0,1fr)_340px]">
          <div className="flex min-w-0 flex-col gap-3">{children}</div>

          <aside aria-label="변경 항목 및 히스토리 기록" className="sticky top-0 flex flex-col gap-4 self-stretch border-l-2 border-line pl-5">
            <ChangeSummary changes={changes} />
            <Field label="Zendesk 티켓 번호" required>
              {(id) => <TextInput id={id} value={ticket} onChange={(e) => onTicketChange(e.target.value)} placeholder="TKT-2024-0523-001" />}
            </Field>
            <Field label="작업 사유" required>
              {(id) => <TextInput id={id} value={reason} onChange={(e) => onReasonChange(e.target.value)} placeholder="고객사 요청 내용 또는 내부 처리 사유" />}
            </Field>
            <dl className="m-0 grid grid-cols-2 gap-2.5 rounded-xl border border-line-soft bg-bg p-3.5 text-[13px]">
              {(
                [
                  ['액션 유저', audit.actor],
                  ['액션 시각', audit.at],
                  ['고객사', audit.company],
                  ['작동 기능', audit.action],
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
            취소
          </Button>
          <Button variant="primary" onClick={onSave} loading={saving} disabled={!canSave} className="h-[42px] px-5 text-sm font-semibold">
            저장 · 히스토리 기록
          </Button>
        </div>
      </div>
    </div>
  )
}

/** 모달 좌측 입력 영역의 필드 묶음 카드 */
export function FieldGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-line bg-bg/50 p-3.5">
      <span className="text-[11px] font-semibold tracking-wide text-ink-4">{title}</span>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </section>
  )
}
