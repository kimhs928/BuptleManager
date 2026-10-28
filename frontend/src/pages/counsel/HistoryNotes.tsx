import { useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronDownIcon, ChevronRightIcon, EditIcon } from '../../components/icons'
import { ViewModal } from '../../components/ui'
import { cn } from '../../lib/cn'
import type { CounselComment, CounselHistoryRow } from '../../mocks/counsel'
import { texts } from '../../texts'
import { DeletedBadge } from '../contract/shared'
import { CommentDetailModal, ReplyList, TypeChip } from './CommentParts'
import { isLong } from './commentText'

const t = texts.counsel.historyNotes

/** 히스토리 박스 안의 작은 토글 버튼 */
function Toggle({ open, disabled, onClick, children }: { open: boolean; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-expanded={open}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-7 items-center gap-1 rounded-full border px-2.5 text-xs font-semibold',
        disabled ? 'cursor-default border-line-soft bg-transparent text-ink-5' : open ? 'border-ink bg-ink text-white' : 'border-line-strong bg-surface text-ink-2 hover:bg-hover',
      )}
    >
      {!disabled && <ChevronDownIcon size={12} strokeWidth={2.4} className={cn('shrink-0 transition-transform', !open && '-rotate-90')} />}
      {children}
    </button>
  )
}

function MoreButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-0.5 border-0 bg-transparent p-0 text-xs font-medium text-link hover:underline">
      {t.more}
      <ChevronRightIcon size={10} />
    </button>
  )
}

function CommentItem({ comment, counselId }: { comment: CounselComment; counselId: string }) {
  const [repliesOpen, setRepliesOpen] = useState(false)
  const [detail, setDetail] = useState(false)
  const n = comment.replies.length

  return (
    <li className={cn('flex flex-col gap-1.5 rounded-lg border px-3 py-2.5', comment.deleted ? 'border-danger-line bg-[#fafafb]' : 'border-line-soft bg-[#f6f6f8]')}>
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        <TypeChip type={comment.type} />
        <span className={cn('text-[13px] font-semibold', comment.deleted ? 'text-ink-4' : 'text-ink')}>{comment.author}</span>
        <span className="tabular-nums text-ink-4">{t.written(comment.at)}</span>
        {comment.deleted && <DeletedBadge label={t.deleted} />}
        {/* 수정은 코멘트 탭에서 한다. 해당 코멘트로 바로 이동한다 */}
        <a href={`?counsel=${counselId}&tab=comments&comment=${comment.id}`} className="ml-auto inline-flex items-center gap-1 font-medium text-link hover:underline">
          <EditIcon size={11} />
          {t.editInTab}
        </a>
      </span>
      <span className={cn('line-clamp-3 whitespace-pre-wrap text-[13px] leading-[1.5]', comment.deleted && 'text-ink-4')}>{comment.text}</span>
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {isLong(comment.text) && <MoreButton onClick={() => setDetail(true)} />}
        {n > 0 && (
          <button type="button" aria-expanded={repliesOpen} onClick={() => setRepliesOpen((v) => !v)} className="inline-flex items-center gap-0.5 border-0 bg-transparent p-0 text-xs font-medium text-ink-2 hover:underline">
            <ChevronDownIcon size={11} strokeWidth={2.4} className={cn('transition-transform', !repliesOpen && '-rotate-90')} />
            {repliesOpen ? t.hideReplies : t.replies(n)}
          </button>
        )}
      </span>
      {repliesOpen && <ReplyList replies={comment.replies} className="ml-3 border-l-2 border-line-strong pl-3" />}
      {detail && <CommentDetailModal comment={comment} onClose={() => setDetail(false)} />}
    </li>
  )
}

type Props = {
  row: CounselHistoryRow
  counselId: string
  /** 이 자문의 모든 코멘트. 이 히스토리에 연결된 것만 보여 준다 */
  comments: CounselComment[]
}

/** 히스토리 박스 아래의 본문 · 코멘트 토글. 길면 상세 보기로 원문을 팝업에서 본다 */
export function HistoryNotes({ row, counselId, comments }: Props) {
  const [bodyOpen, setBodyOpen] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [detail, setDetail] = useState(false)

  const linked = comments.filter((c) => c.historyId === row.id)

  return (
    <div className="flex flex-col gap-2">
      <span className="flex flex-wrap items-center gap-2">
        <Toggle open={bodyOpen} onClick={() => setBodyOpen((v) => !v)}>
          {bodyOpen ? t.hideBody : t.showBody}
        </Toggle>
        <Toggle open={commentsOpen} disabled={linked.length === 0} onClick={() => setCommentsOpen((v) => !v)}>
          {linked.length === 0 ? t.noComments : commentsOpen ? t.hideComments : t.showComments(linked.length)}
        </Toggle>
      </span>

      {bodyOpen && (
        <div className="flex flex-col items-start gap-1 rounded-lg bg-[#f6f6f8] px-3 py-2.5">
          <span className="line-clamp-3 whitespace-pre-wrap text-[12.5px] leading-[1.5] text-ink-2">{row.comment}</span>
          {isLong(row.comment) && <MoreButton onClick={() => setDetail(true)} />}
        </div>
      )}

      {commentsOpen && linked.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {linked.map((c) => (
            <CommentItem key={c.id} comment={c} counselId={counselId} />
          ))}
        </ul>
      )}

      {detail && (
        <ViewModal title={t.bodyTitle} description={`${row.action} · ${row.user} · ${row.at}`} onClose={() => setDetail(false)}>
          <div className="whitespace-pre-wrap rounded-xl border border-line bg-[#f2f2f5] px-4 py-3.5 text-[13px] leading-relaxed">{row.comment}</div>
        </ViewModal>
      )}
    </div>
  )
}
