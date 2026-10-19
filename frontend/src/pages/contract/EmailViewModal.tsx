import { CopyIcon } from '../../components/icons'
import { Button, ViewModal } from '../../components/ui'
import type { ContractEmail } from '../../mocks/contract'
import { texts } from '../../texts'

const t = texts.contract.emailView

type Props = {
  email: ContractEmail
  copied: boolean
  onCopy: () => void
  onClose: () => void
}

/** 이메일 내용 보기 */
export function EmailViewModal({ email, copied, onCopy, onClose }: Props) {
  const rows: [string, string][] = [
    [t.fields.sender, `${email.sender} · ${email.senderMail}`],
    [t.fields.receiver, `${email.receiver} · ${email.receiverMail}`],
    [t.fields.createdAt, email.createdAt],
    [t.fields.updatedAt, email.updatedAt],
    [t.fields.contractId, email.contractId],
    [t.fields.link, email.link],
  ]

  return (
    <ViewModal
      title={t.title}
      description={email.subject}
      onClose={onClose}
      actions={
        <Button variant="secondary" icon={<CopyIcon size={14} />} onClick={onCopy} className="h-[42px] px-[18px] text-sm">
          {copied ? texts.contract.history.copied : texts.contract.history.copyLink}
        </Button>
      }
    >
      <dl className="m-0 grid grid-cols-[120px_minmax(0,1fr)] gap-x-4 gap-y-2 text-[13px]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-ink-4">{k}</dt>
            <dd className="m-0 break-all font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-ink-3">{t.body}</span>
        <div className="whitespace-pre-wrap rounded-xl border border-line bg-bg px-4 py-3.5 text-[13px] leading-relaxed">{email.body}</div>
      </div>
    </ViewModal>
  )
}
