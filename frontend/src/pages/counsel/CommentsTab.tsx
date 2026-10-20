import { useState } from 'react'
import { ChevronRightIcon, EditIcon } from '../../components/icons'
import { Button, ViewModal } from '../../components/ui'
import { cn } from '../../lib/cn'
import type { CommentType, CounselComment } from '../../mocks/counsel'
import { texts } from '../../texts'
import { deletedRow, tableTd, tableTh } from '../contract/format'
import { CommentEditModal } from './CommentEditModal'

const t = texts.counsel.comments

const typeTone: Record<CommentType, string> = {
  질문: 'border border-[#fbe08a] bg-[#fff7db] text-[#7a5800]',
  답변: 'border border-line-strong bg-[#f2f2f5] text-ink',
  '내부 메모': 'border border-divider bg-[#f2f2f5] text-ink-3',
}

const LONG = 60

function TypeChip({ type }: { type: CommentType }) {
  return <span className={cn('inline-flex items-center rounded-full px-2 py-px text-[11.5px] font-semibold', typeTone[type])}>{type}</span>
}

function DeletedChip({ deleted }: { deleted: boolean }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-px text-[11.5px] font-semibold', deleted ? 'border-danger-line bg-danger-soft text-danger-ink' : 'border-success-line bg-success-soft text-success-ink')}>
      {deleted ? t.deleted : t.active}
    </span>
  )
}

type Props = {
  counselId: string
  comments: CounselComment[]
  onEdit: (next: CounselComment, ticket: string) => void
}

/** 코멘트 탭 */
export function CommentsTab({ counselId, comments, onEdit }: Props) {
  const [editing, setEditing] = useState<CounselComment | null>(null)
  const [viewing, setViewing] = useState<CounselComment | null>(null)

  const deletedCount = comments.filter((c) => c.deleted).length

  return (
    <section aria-labelledby="counsel-comments-title" className="flex flex-col gap-2">
      <div className="flex flex-wrap items-end justify-between gap-4 px-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 id="counsel-comments-title" className="m-0 text-[13px] font-semibold">
            {t.title}
          </h2>
          <span className="text-xs text-ink-4">{t.description}</span>
        </div>
        <span className="text-xs tabular-nums text-ink-4">{t.total(comments.length, deletedCount)}</span>
      </div>

      <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-[13.5px]">
            <thead>
              <tr>
                <th scope="col" className={cn(tableTh, 'w-[34%] pl-5')}>{t.columns.text}</th>
                <th scope="col" className={tableTh}>{t.columns.type}</th>
                <th scope="col" className={tableTh}>{t.columns.author}</th>
                <th scope="col" className={tableTh}>{t.columns.at}</th>
                <th scope="col" className={tableTh}>{t.columns.updatedAt}</th>
                <th scope="col" className={tableTh}>{t.columns.deleted}</th>
                <th scope="col" className={tableTh}>{t.columns.deletedAt}</th>
                <th scope="col" className={cn(tableTh, 'pr-5 text-right')}>{t.columns.action}</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((c) => (
                <tr key={c.id} className={cn('border-t border-line-soft', c.deleted ? deletedRow : 'bg-surface hover:bg-hover')}>
                  <td className={cn(tableTd, 'pl-5')}>
                    <span className="flex flex-col items-start gap-1">
                      <span className={cn('line-clamp-2 leading-[1.5]', c.deleted && 'text-ink-4')}>{c.text}</span>
                      {c.text.length > LONG && (
                        <button type="button" onClick={() => setViewing(c)} className="inline-flex items-center gap-0.5 border-0 bg-transparent p-0 text-xs font-medium text-link hover:underline">
                          {t.more}
                          <ChevronRightIcon size={10} />
                        </button>
                      )}
                    </span>
                  </td>
                  <td className={cn(tableTd, 'whitespace-nowrap')}>
                    <TypeChip type={c.type} />
                  </td>
                  <td className={cn(tableTd, 'whitespace-nowrap', c.deleted ? 'text-ink-5' : 'text-ink-2')}>{c.author}</td>
                  <td className={cn(tableTd, 'whitespace-nowrap tabular-nums', c.deleted ? 'text-ink-5' : 'text-ink-3')}>{c.at}</td>
                  <td className={cn(tableTd, 'whitespace-nowrap tabular-nums', c.deleted ? 'text-ink-5' : 'text-ink-3')}>{c.updatedAt}</td>
                  <td className={cn(tableTd, 'whitespace-nowrap')}>
                    <DeletedChip deleted={c.deleted} />
                  </td>
                  <td className={cn(tableTd, 'whitespace-nowrap tabular-nums', c.deleted ? 'text-danger-ink' : 'text-ink-5')}>{c.deletedAt || '-'}</td>
                  <td className={cn(tableTd, 'pr-5 text-right')}>
                    <button
                      type="button"
                      aria-label={t.edit}
                      title={t.edit}
                      onClick={() => setEditing(c)}
                      className="inline-flex size-[30px] items-center justify-center rounded-ctl bg-primary text-white hover:brightness-105"
                    >
                      <EditIcon size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line-soft px-5 py-3 text-xs text-ink-4">{t.footer}</div>
      </div>

      {viewing && !editing && (
        <ViewModal
          title={texts.counsel.commentView.title}
          onClose={() => setViewing(null)}
          actions={
            <Button
              icon={<EditIcon size={14} />}
              onClick={() => {
                setEditing(viewing)
                setViewing(null)
              }}
              className="h-[42px] px-[18px] text-sm"
            >
              {t.edit}
            </Button>
          }
        >
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-3">
            <TypeChip type={viewing.type} />
            <span className="font-medium text-ink">{viewing.author}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{texts.counsel.commentView.written(viewing.at)}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{texts.counsel.commentView.modified(viewing.updatedAt)}</span>
            <DeletedChip deleted={viewing.deleted} />
          </div>
          <div className="whitespace-pre-wrap rounded-xl border border-line bg-[#f2f2f5] px-4 py-3.5 text-[13px] leading-relaxed">{viewing.text}</div>
        </ViewModal>
      )}
      {editing && (
        <CommentEditModal
          counselId={counselId}
          comment={editing}
          onClose={() => setEditing(null)}
          onSave={(next, ticket) => {
            onEdit(next, ticket)
            setEditing(null)
          }}
        />
      )}
    </section>
  )
}
