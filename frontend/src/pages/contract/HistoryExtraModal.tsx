import type { ReactNode } from 'react'
import { DownloadIcon, EyeIcon } from '../../components/icons'
import { ViewModal } from '../../components/ui'
import { cn } from '../../lib/cn'
import { HTML_TYPE_INFO, SIGN_CLS, SIGN_METHOD_CODE } from '../../mocks/contract'
import type { HistoryRow } from '../../mocks/contract'
import { texts } from '../../texts'
import { docButtonState } from './historyExtra'

const t = texts.contract.historyExtra

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="flex flex-col gap-2">
      <h3 className="m-0 text-xs font-semibold text-ink-3">{title}</h3>
      <div className="rounded-xl border border-line bg-surface px-4 py-3.5">{children}</div>
    </section>
  )
}

function Rows({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="m-0 grid grid-cols-[150px_minmax(0,1fr)] gap-x-4 gap-y-2 text-[13px]">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-ink-4">{k}</dt>
          <dd className="m-0 min-w-0 break-words font-medium">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

const chip = 'inline-flex items-center rounded-full border border-divider bg-[#f2f2f5] px-2 py-px text-[11.5px] font-semibold text-ink-2'

type Props = {
  row: HistoryRow
  onClose: () => void
}

/** 히스토리 상세 (extra_info 에 저장된 부가 정보) */
export function HistoryExtraModal({ row, onClose }: Props) {
  const { extra } = row
  const info = HTML_TYPE_INFO[extra.htmlType]
  const button = docButtonState(row)

  return (
    <ViewModal wide title={t.title} description={`${row.action} · ${row.at}`} onClose={onClose}>
      <Section title={t.basic}>
        <Rows
          rows={[
            [t.fields.action, row.action],
            [t.fields.user, row.user],
            [t.fields.at, <span key="at" className="tabular-nums">{row.at}</span>],
            [t.fields.move, `${row.from} → ${row.to}`],
            [t.fields.comment, row.comment || t.none],
            [t.fields.deleted, row.deleted ? t.deletedYes : t.deletedNo],
          ]}
        />
      </Section>

      <Section title={t.htmlType}>
        <Rows
          rows={[
            [t.fields.htmlType, <span key="ht" className="inline-flex items-center gap-2"><span className={chip}>{extra.htmlType}</span>{info.label}</span>],
            [t.fields.actions, info.actions],
            [t.fields.screen, info.screen],
          ]}
        />
      </Section>

      <Section title={t.compareDoc}>
        <Rows
          rows={[
            [t.fields.compareDoc, <span key="cd" className={chip}>{String(extra.compareDoc)}</span>],
            [t.fields.docId, extra.docId ? <code key="di" className="font-mono text-xs">{extra.docId}</code> : <span key="di" className="font-normal text-ink-5">{t.none}</span>],
            [
              t.fields.docButton,
              <span key="db" className="inline-flex flex-wrap items-center gap-2">
                <span className={cn(chip, button === 'enabled' && 'border-success-line bg-success-soft text-success-ink')}>{t.docButtonState[button]}</span>
                {button === 'enabled' && (
                  <>
                    <a href={`#${extra.docId}`} className="inline-flex h-7 items-center gap-1.5 rounded-[7px] border border-line-strong bg-surface px-2.5 text-xs font-medium text-ink hover:bg-hover">
                      <EyeIcon size={12} />
                      {t.docView}
                    </a>
                    <a href={`#${extra.docId}`} className="inline-flex h-7 items-center gap-1.5 rounded-[7px] border border-line-strong bg-surface px-2.5 text-xs font-medium text-ink hover:bg-hover">
                      <DownloadIcon size={12} />
                      {t.docDownload}
                    </a>
                  </>
                )}
              </span>,
            ],
          ]}
        />
        <p className="m-0 mt-2.5 text-[11.5px] leading-normal text-ink-4">{t.compareNote}</p>
      </Section>

      {(extra.signCls !== undefined || extra.signMethod !== undefined) && (
        <Section title={t.sign}>
          <Rows
            rows={[
              [
                t.fields.signCls,
                extra.signCls !== undefined ? (
                  <span key="sc" className="inline-flex flex-wrap items-center gap-2">
                    <span className={chip}>{extra.signCls}</span>
                    {SIGN_CLS[extra.signCls].label}
                    <code className="font-mono text-[11px] font-normal text-ink-4">{SIGN_CLS[extra.signCls].constant}</code>
                  </span>
                ) : (
                  t.none
                ),
              ],
              [
                t.fields.signMethod,
                extra.signMethod !== undefined ? (
                  <span key="sm" className="inline-flex flex-wrap items-center gap-2">
                    <span className={chip}>{extra.signMethod}</span>
                    {SIGN_METHOD_CODE[extra.signMethod]}
                  </span>
                ) : (
                  t.none
                ),
              ],
            ]}
          />
        </Section>
      )}

      {extra.commenter && (
        <Section title={t.comment}>
          <Rows rows={[[t.fields.commenter, extra.commenter], [t.fields.commentActions, t.commentActions]]} />
        </Section>
      )}

      {extra.result && (
        <Section title={t.result}>
          <Rows rows={[[t.fields.result, <span key="r" className={cn(chip, extra.result === '승인' ? 'border-success-line bg-success-soft text-success-ink' : 'border-danger-line bg-danger-soft text-danger-ink')}>{extra.result}</span>]]} />
        </Section>
      )}

      {extra.email && (
        <Section title={t.email}>
          <Rows
            rows={[
              [t.fields.subject, extra.email.subject],
              [t.fields.body, <span key="b" className="line-clamp-2 whitespace-pre-wrap font-normal">{extra.email.body}</span>],
              [t.fields.attachments, extra.email.attachments.length > 0 ? extra.email.attachments.join(', ') : t.none],
            ]}
          />
        </Section>
      )}

      {extra.participants && (
        <Section title={t.participants}>
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[13px]">
            {extra.participants.map((p) => (
              <li key={`${p.name}-${p.change}`} className="flex items-center gap-2.5">
                <span className={cn(chip, p.change === '추가' && 'border-success-line bg-success-soft text-success-ink', p.change === '삭제' && 'border-danger-line bg-danger-soft text-danger-ink')}>{p.change}</span>
                <span className="font-medium">{p.name}</span>
                <span className="text-ink-4">{p.role}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {extra.attachments && (
        <Section title={t.attachments}>
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[13px]">
            {extra.attachments.map((a) => (
              <li key={`${a.name}-${a.change}`} className="flex items-center gap-2.5">
                <span className={cn(chip, a.change === '추가' && 'border-success-line bg-success-soft text-success-ink', a.change === '삭제' && 'border-danger-line bg-danger-soft text-danger-ink')}>{a.change}</span>
                <span className="break-all font-medium">{a.name}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {extra.transfer && (
        <Section title={t.transfer}>
          <Rows rows={[[t.fields.transferKind, extra.transfer.kind], [t.fields.transferMove, `${extra.transfer.from} → ${extra.transfer.to}`]]} />
        </Section>
      )}
    </ViewModal>
  )
}
