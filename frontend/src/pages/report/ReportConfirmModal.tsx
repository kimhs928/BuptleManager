import { useState } from 'react'
import { Alert, EditModal, FieldGroup } from '../../components/ui'
import { formatDateTime } from '../../lib/date'
import { texts } from '../../texts'
import { makeAudit } from '../contract/audit'

const t = texts.report.confirm

type Props = {
  /** 추출 조건 (이름, 값) */
  conditions: { label: string; value: string }[]
  summary: string
  count: number
  onClose: () => void
  onRun: (ticket: string) => void
}

/** 오류 리포트 추출 확인 */
export function ReportConfirmModal({ conditions, summary, count, onClose, onRun }: Props) {
  const [ticket, setTicket] = useState('')
  const [reason, setReason] = useState('')
  const [openedAt] = useState(() => formatDateTime())

  return (
    <EditModal
      title={t.title}
      description={summary}
      saveLabel={t.run}
      showChanges={false}
      changes={[]}
      canSubmit={count > 0}
      audit={makeAudit(t.action, openedAt)}
      ticket={ticket}
      onTicketChange={setTicket}
      reason={reason}
      onReasonChange={setReason}
      onClose={onClose}
      onSave={() => onRun(ticket.trim())}
    >
      <FieldGroup title={t.conditions} columns={1}>
        <dl className="m-0 flex flex-col overflow-hidden rounded-[10px] border border-line-soft">
          {conditions.map((c) => (
            <div key={c.label} className="flex items-center gap-2.5 border-t border-line-soft px-3 py-[9px] text-[12.5px] first:border-t-0">
              <dt className="w-[120px] shrink-0 text-ink-3">{c.label}</dt>
              <span aria-hidden="true" className="text-ink-5">
                =
              </span>
              <dd className="m-0 break-all font-medium">{c.value}</dd>
            </div>
          ))}
        </dl>
      </FieldGroup>

      <Alert tone="warn">{t.privacy}</Alert>
    </EditModal>
  )
}
