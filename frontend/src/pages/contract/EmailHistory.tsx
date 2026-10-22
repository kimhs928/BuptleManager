import { useEffect, useRef, useState } from 'react'
import { CheckIcon, EyeIcon, LinkIcon } from '../../components/icons'
import { cn } from '../../lib/cn'
import type { CaseEmail } from '../../mocks/contract'
import { texts } from '../../texts'
import { EmailViewModal } from './EmailViewModal'

const t = texts.contract.history

/** 시안의 카드: 둥근 흰 박스 */
const box = 'rounded-card border border-line bg-surface shadow-card'

const th = 'whitespace-nowrap border-b border-line-soft px-3.5 py-2.5 text-left text-xs font-medium text-ink-4'
const td = 'px-3.5 py-[11px] whitespace-nowrap'
const smallBtn = 'inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-[7px] border px-3 text-xs font-medium'

/** 이메일 발송 내역 (계약 · 자문 · 소송 공통) */
export function EmailHistory({ emails }: { emails: CaseEmail[] }) {
  const [viewing, setViewing] = useState<CaseEmail | null>(null)
  const [copiedId, setCopiedId] = useState('')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async (e: CaseEmail) => {
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
    <>
      <section aria-labelledby="email-title" className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3 px-3">
          <h2 id="email-title" className="m-0 text-[13px] font-semibold">
            {t.emailTitle}
          </h2>
          <span className="text-xs text-ink-4">{t.emailCount(emails.length)}</span>
        </div>
        <div className={cn(box, 'overflow-hidden')}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1060px] border-collapse text-[13px]">
              <thead>
                <tr>
                  <th scope="col" className={cn(th, 'pl-5')}>{t.emailColumns.createdAt}</th>
                  <th scope="col" className={th}>{t.emailColumns.updatedAt}</th>
                  <th scope="col" className={th}>{t.emailColumns.sender}</th>
                  <th scope="col" className={th}>{t.emailColumns.receiver}</th>
                  <th scope="col" className={th}>{t.emailColumns.subject}</th>
                  <th scope="col" className={th}>{t.emailColumns.link}</th>
                  <th scope="col" className={cn(th, 'pr-5')}>{t.emailColumns.body}</th>
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
                    <td className={cn(td, 'pr-5')}>
                      <button type="button" onClick={() => setViewing(m)} className={cn(smallBtn, 'border-line-strong bg-surface text-ink hover:bg-hover')}>
                        <EyeIcon size={13} />
                        {t.viewBody}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      {viewing && <EmailViewModal email={viewing} copied={copiedId === viewing.id} onCopy={() => void copy(viewing)} onClose={() => setViewing(null)} />}
    </>
  )
}
