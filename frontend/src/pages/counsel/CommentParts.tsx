import type { ReactNode } from 'react'
import { EditIcon } from '../../components/icons'
import { ViewModal } from '../../components/ui'
import { cn } from '../../lib/cn'
import type { CommentType, CounselComment, CounselReply } from '../../mocks/counsel'
import { texts } from '../../texts'
import { DeletedBadge } from '../contract/shared'

const typeTone: Record<CommentType, string> = {
  질문: 'border border-transparent bg-[#fec601] text-[#3a2e00]',
  답변: 'border border-transparent bg-[#2fa24f] text-white',
}

/** 코멘트 종류 칩 (질문 · 답변) */
export function TypeChip({ type }: { type: CommentType }) {
  return <span className={cn('inline-flex h-6 w-[76px] items-center justify-center rounded-md text-[12px] font-semibold', typeTone[type])}>{type}</span>
}

/** 질문 · 답변에 달린 댓글 목록 */
export function ReplyList({ replies, className, onEdit }: { replies: CounselReply[]; className?: string; /** 있으면 댓글마다 수정 버튼을 그린다 */ onEdit?: (reply: CounselReply) => void }) {
  const t = texts.counsel.comments
  return (
    <ul className={cn('m-0 flex list-none flex-col gap-1.5 p-0', className)}>
      {replies.map((r) => (
        <li key={r.id} className={cn('flex flex-col gap-0.5 rounded-lg border px-3 py-2', r.deleted ? 'border-danger-line bg-[#fafafb]' : 'border-line-soft bg-[#f6f6f8]')}>
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
            <span className={cn('font-semibold', r.deleted ? 'text-ink-4' : 'text-ink')}>{r.author}</span>
            <span className="tabular-nums text-ink-4">{r.at}</span>
            {r.deleted && <DeletedBadge label={t.replyDeleted} />}
            {onEdit && (
              <button
                type="button"
                aria-label={`${r.author} ${t.replyEdit}`}
                title={t.replyEdit}
                onClick={() => onEdit(r)}
                className="ml-auto inline-flex size-6 items-center justify-center rounded-ctl bg-primary text-white hover:brightness-105"
              >
                <EditIcon size={12} />
              </button>
            )}
          </span>
          <span className={cn('whitespace-pre-wrap text-[13px] leading-[1.5]', r.deleted && 'text-ink-4')}>{r.text}</span>
        </li>
      ))}
    </ul>
  )
}

function DeletedChip({ deleted }: { deleted: boolean }) {
  const t = texts.counsel.comments
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-px text-[11.5px] font-semibold', deleted ? 'border-danger-line bg-danger-soft text-danger-ink' : 'border-success-line bg-success-soft text-success-ink')}>
      {deleted ? t.deleted : t.active}
    </span>
  )
}

/** 코멘트 원문 팝업. 댓글도 같이 보여 준다 */
export function CommentDetailModal({ comment, onClose, actions, onEditReply }: { comment: CounselComment; onClose: () => void; actions?: ReactNode; onEditReply?: (reply: CounselReply) => void }) {
  const v = texts.counsel.commentView
  return (
    <ViewModal title={v.title} onClose={onClose} actions={actions}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-3">
        <TypeChip type={comment.type} />
        <span className="font-medium text-ink">{comment.author}</span>
        <span aria-hidden="true">·</span>
        <span className="tabular-nums">{v.written(comment.at)}</span>
        <span aria-hidden="true">·</span>
        <span className="tabular-nums">{v.modified(comment.updatedAt)}</span>
        <DeletedChip deleted={comment.deleted} />
      </div>
      <div className="whitespace-pre-wrap rounded-xl border border-line bg-[#f2f2f5] px-4 py-3.5 text-[13px] leading-relaxed">{comment.text}</div>
      <div className="flex flex-col gap-2">
        <h3 className="m-0 text-[13px] font-semibold">{v.replies(comment.replies.length)}</h3>
        {comment.replies.length > 0 ? <ReplyList replies={comment.replies} onEdit={onEditReply} /> : <span className="text-[13px] text-ink-4">{v.noReplies}</span>}
      </div>
    </ViewModal>
  )
}
