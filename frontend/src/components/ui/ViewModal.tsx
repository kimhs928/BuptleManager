import { useRef } from 'react'
import type { ReactNode } from 'react'
import { useModalFocus } from '../../hooks/useModalFocus'
import { texts } from '../../texts'
import { CloseIcon } from '../icons'
import { Button } from './Button'

type Props = {
  title: string
  description?: string
  onClose: () => void
  /** 닫기 버튼 왼쪽에 놓을 동작 */
  actions?: ReactNode
  children: ReactNode
}

/** 조회용 모달 틀 (입력·저장 없음) */
export function ViewModal({ title, description, onClose, actions, children }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useModalFocus(dialogRef, onClose)

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-navy/55 p-6">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-modal-title"
        className="flex max-h-full w-full max-w-[720px] flex-col overflow-hidden rounded-[18px] bg-surface shadow-modal"
      >
        <div className="flex items-center gap-3.5 border-b border-line-soft px-6 py-[18px]">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h2 id="view-modal-title" className="m-0 text-[17px] font-semibold">
              {title}
            </h2>
            {description && <span className="truncate text-[13px] text-ink-3">{description}</span>}
          </div>
          <button type="button" aria-label={texts.common.action.close} onClick={onClose} className="flex size-8 items-center justify-center rounded-ctl text-ink-4 hover:bg-fill">
            <CloseIcon size={16} strokeWidth={2.2} />
          </button>
        </div>
        <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">{children}</div>
        <div className="flex justify-end gap-2.5 border-t border-line-soft bg-bg/60 px-6 py-3.5">
          {actions}
          <Button variant="secondary" onClick={onClose} className="h-[42px] px-[18px] text-sm">
            {texts.common.action.close}
          </Button>
        </div>
      </div>
    </div>
  )
}
