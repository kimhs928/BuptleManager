import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { texts } from '../../texts'
import { CloseIcon } from '../icons'
import { Button } from './Button'
import { ChangeSummary } from './ChangeSummary'
import type { Change } from './ChangeSummary'
import { Field, TextInput } from './Field'

const t = texts.common.editModal

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
  children,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  // onClose가 매 렌더링마다 바뀌어도 이벤트 리스너를 다시 등록하지 않도록 ref로 보관
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  // 열릴 때 포커스를 모달로 옮기고, Esc로 닫고, Tab을 모달 안에 가두고, 닫힐 때 원래 위치로 되돌린다
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const focusable = () =>
      Array.from(dialog.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(
        (el) => !el.hasAttribute('disabled'),
      )
    // 제목 옆 닫기 버튼 대신 첫 입력 요소를 우선 포커스한다
    const first = dialog.querySelector<HTMLElement>('input, select, textarea') ?? focusable()[0]
    first?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onCloseRef.current()
      if (e.key !== 'Tab') return
      const items = focusable()
      if (items.length === 0) return
      const head = items[0]
      const tail = items[items.length - 1]
      if (e.shiftKey && document.activeElement === head) {
        e.preventDefault()
        tail.focus()
      } else if (!e.shiftKey && document.activeElement === tail) {
        e.preventDefault()
        head.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previous?.focus()
    }
  }, [])

  const canSave = changes.length > 0 && ticket.trim() !== '' && reason.trim() !== ''

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
            <ChangeSummary changes={changes} />
            <Field label={t.ticket.label} required>
              {(id) => <TextInput id={id} value={ticket} onChange={(e) => onTicketChange(e.target.value)} placeholder={t.ticket.placeholder} />}
            </Field>
            <Field label={t.reason.label} required>
              {(id) => <TextInput id={id} value={reason} onChange={(e) => onReasonChange(e.target.value)} placeholder={t.reason.placeholder} />}
            </Field>
            <dl className="m-0 grid grid-cols-2 gap-2.5 rounded-xl border border-line-soft bg-bg p-3.5 text-[13px]">
              {(
                [
                  [t.audit.actor, audit.actor],
                  [t.audit.at, audit.at],
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
          <Button variant="primary" onClick={onSave} loading={saving} disabled={!canSave} className="h-[42px] px-5 text-sm font-semibold">
            {t.save}
          </Button>
        </div>
      </div>
    </div>
  )
}

/** 필드 묶음 카드 */
export function FieldGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-line bg-bg/50 p-3.5">
      <span className="text-[11px] font-semibold tracking-wide text-ink-4">{title}</span>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </section>
  )
}
