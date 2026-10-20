import { useState } from 'react'
import { Alert, EditModal, FieldGroup } from '../../components/ui'
import { formatDateTime } from '../../lib/date'
import { texts } from '../../texts'
import { makeAudit } from '../contract/audit'

const t = texts.user.export

type Props = {
  count: number
  /** 적용 중인 검색 조건 (이름, 값) */
  conditions: { label: string; value: string }[]
  onClose: () => void
  onRun: (ticket: string) => void
}

/** 유저 데이터 엑셀 추출 */
export function UserExportModal({ count, conditions, onClose, onRun }: Props) {
  const [ticket, setTicket] = useState('')
  const [reason, setReason] = useState('')
  const [openedAt] = useState(() => formatDateTime())
  const shown = conditions.length > 0 ? conditions : [t.noCondition]

  return (
    <EditModal
      title={t.title}
      description={t.description}
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
      <dl className="m-0 grid grid-cols-3 gap-2.5">
        {(
          [
            [t.target, texts.user.list.count(count)],
            [t.format, t.formatValue],
            [t.columns, t.columnsValue],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1 rounded-[10px] bg-bg px-3.5 py-3">
            <dt className="text-[11.5px] text-ink-4">{label}</dt>
            <dd className="m-0 text-lg font-semibold tracking-[-0.01em]">{value}</dd>
          </div>
        ))}
      </dl>

      <FieldGroup title={t.conditions(conditions.length)} columns={1}>
        <dl className="m-0 flex flex-col overflow-hidden rounded-[10px] border border-line-soft">
          {shown.map((c) => (
            <div key={c.label} className="flex items-center gap-2.5 border-t border-line-soft px-3 py-[9px] text-[12.5px] first:border-t-0">
              <dt className="w-[160px] shrink-0 text-ink-3">{c.label}</dt>
              <span aria-hidden="true" className="text-ink-5">
                =
              </span>
              <dd className="m-0 font-medium">{c.value}</dd>
            </div>
          ))}
        </dl>
      </FieldGroup>

      <Alert tone="warn">{t.privacy}</Alert>
    </EditModal>
  )
}
