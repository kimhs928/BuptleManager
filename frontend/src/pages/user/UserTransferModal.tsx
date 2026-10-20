import { useState } from 'react'
import { ArrowRightIcon } from '../../components/icons'
import { Alert, EditModal, FieldGroup } from '../../components/ui'
import type { Change } from '../../components/ui'
import { formatDateTime } from '../../lib/date'
import type { TransferType } from '../../mocks/user'
import { texts } from '../../texts'
import { makeAudit } from '../contract/audit'

const t = texts.user.transfer

type Person = { name: string; email: string; userId: string }

type Props = {
  type: TransferType
  from: Person
  to: Person
  ids: string[]
  onClose: () => void
  onConfirm: (ticket: string) => void
}

/** 이관 확인 */
export function UserTransferModal({ type, from, to, ids, onClose, onConfirm }: Props) {
  const [ticket, setTicket] = useState('')
  const [reason, setReason] = useState('')
  const [openedAt] = useState(() => formatDateTime())

  const label = (p: Person) => `${p.name} (${p.email})`
  const changes: Change[] = [
    { field: `${type} ${ids.length}건`, before: label(from), after: label(to) },
    { field: t.changeIds, before: t.owner(from.userId), after: `${ids.join(', ')} → ${to.userId}` },
  ]

  return (
    <EditModal
      title={t.confirmTitle(type)}
      description={t.confirmDescription(ids.length)}
      saveLabel="실행"
      changes={changes}
      audit={makeAudit(t.action(type), openedAt)}
      ticket={ticket}
      onTicketChange={setTicket}
      reason={reason}
      onReasonChange={setReason}
      onClose={onClose}
      onSave={() => onConfirm(ticket.trim())}
    >
      <FieldGroup title={t.usersGroup} columns={1}>
        <div className="flex items-center gap-3.5">
          <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
            <span className="text-[11.5px] text-ink-4">{t.from}</span>
            <span className="text-[13.5px] font-medium">{label(from)}</span>
          </span>
          <ArrowRightIcon size={18} className="shrink-0 text-ink-5" />
          <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
            <span className="text-[11.5px] text-ink-4">{t.to}</span>
            <span className="text-[13.5px] font-medium">{label(to)}</span>
          </span>
        </div>
      </FieldGroup>
      <Alert tone="warn">{t.warning}</Alert>
    </EditModal>
  )
}
