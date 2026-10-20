import { CheckIcon, CopyIcon } from '../../components/icons'
import { Button, ViewModal } from '../../components/ui'
import type { ConfigRow, PublicConfigRow } from '../../mocks/companyDetail'
import { texts } from '../../texts'

const t = texts.company.config.valueView

/** 상세보기 대상. 값과 설명 중 어느 칸을 열었는지 함께 담는다 */
export type ConfigDetail = { field: 'value' | 'description'; row: ConfigRow | PublicConfigRow }

type Props = {
  detail: ConfigDetail
  copied: boolean
  onCopy: () => void
  onClose: () => void
}

/** 컨피그 값 · 설명 전체 보기 (내용이 매우 길 수 있어 별도 창에서 확인한다) */
export function ConfigValueModal({ detail, copied, onCopy, onClose }: Props) {
  const { field, row } = detail
  const text = field === 'value' && 'value' in row ? row.value : row.description
  const type = 'scope' in row ? texts.company.config.typeLabel[row.scope] : 'PUBLIC'
  const rows: [string, string][] = [
    [t.fields.type, type],
    [t.fields.name, row.name],
    [t.fields.appliedAt, row.appliedAt],
    [t.fields.appliedBy, row.appliedBy],
  ]

  return (
    <ViewModal
      title={field === 'value' ? t.title : t.descriptionTitle}
      onClose={onClose}
      actions={
        <Button variant="secondary" icon={copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />} onClick={onCopy} className="h-[42px] px-[18px] text-sm">
          {copied ? t.copied : field === 'value' ? t.copy : t.copyDescription}
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
        <span className="flex items-baseline gap-2 text-xs font-semibold text-ink-3">
          {field === 'value' ? t.value : t.description}
          <span className="font-normal text-ink-4">{t.length(text.length)}</span>
        </span>
        <pre className={`m-0 max-h-[360px] overflow-auto whitespace-pre-wrap break-all rounded-xl border border-line bg-[#f2f2f5] px-4 py-3.5 text-xs leading-relaxed ${field === 'value' ? 'font-mono' : 'font-sans text-[13px]'}`}>{text}</pre>
      </div>
    </ViewModal>
  )
}
