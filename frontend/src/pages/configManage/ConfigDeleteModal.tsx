import { useState } from 'react'
import { Alert, EditModal, FieldGroup } from '../../components/ui'
import type { Change } from '../../components/ui'
import { formatDateTime } from '../../lib/date'
import { texts } from '../../texts'
import { makeAudit } from '../contract/audit'
import type { ManagedRow } from './types'

const t = texts.configManage.remove
const typeLabel = texts.configManage.list.typeLabel

type Props = {
  row: ManagedRow
  /** 삭제 대상 고객사 표시 (PUBLIC은 전체 고객사) */
  companyLabel: string
  onClose: () => void
  onSave: (ticket: string) => void
}

/** 컨피그 삭제 확인 */
export function ConfigDeleteModal({ row, companyLabel, onClose, onSave }: Props) {
  const [ticket, setTicket] = useState('')
  const [reason, setReason] = useState('')
  const [openedAt] = useState(() => formatDateTime())

  const changes: Change[] = [{ field: `${typeLabel[row.scope]} · ${row.name}`, before: t.before, after: t.after }]

  return (
    <EditModal
      title={t.title(row.name)}
      description={t.description(companyLabel)}
      saveLabel={t.save}
      changes={changes}
      audit={{ ...makeAudit(t.action, openedAt), company: companyLabel }}
      ticket={ticket}
      onTicketChange={setTicket}
      reason={reason}
      onReasonChange={setReason}
      onClose={onClose}
      onSave={() => onSave(ticket.trim())}
    >
      <Alert tone="danger">{row.scope === 'PUBLIC' ? t.warningPublic : t.warning}</Alert>
      <FieldGroup title={t.targets} columns={1}>
        <dl className="m-0 grid grid-cols-[120px_minmax(0,1fr)] gap-x-4 gap-y-2 text-[13px]">
          <dt className="text-ink-4">{t.customer}</dt>
          <dd className="m-0 font-medium">{companyLabel}</dd>
          <dt className="text-ink-4">CONFIG TYPE</dt>
          <dd className="m-0 font-medium">{typeLabel[row.scope]}</dd>
          <dt className="text-ink-4">CONFIG NAME</dt>
          <dd className="m-0 break-all font-mono text-xs font-medium">{row.name}</dd>
          <dt className="text-ink-4">CONFIG VALUE</dt>
          <dd className="m-0 line-clamp-3 break-all font-mono text-xs">{row.value || texts.configManage.list.noValue}</dd>
          <dt className="text-ink-4">CONFIG DESCRIPTION</dt>
          <dd className="m-0 break-words">{row.description}</dd>
        </dl>
      </FieldGroup>
    </EditModal>
  )
}
