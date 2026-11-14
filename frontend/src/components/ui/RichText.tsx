import { useMemo } from 'react'
import { cn } from '../../lib/cn'
import { looksLikeHtml, sanitizeHtml } from '../../lib/safeHtml'

type Props = {
  /** 일반 글자 또는 HTML */
  text: string
  className?: string
}

/** 서식 글(RichText, RichTextEditor)에 공통으로 쓰는 모양 */
export const richTextClass = [
  'break-words [&_a]:text-link [&_a]:underline [&_blockquote]:my-1 [&_blockquote]:border-l-2 [&_blockquote]:border-line-strong [&_blockquote]:pl-3',
  '[&_code]:rounded [&_code]:bg-fill [&_code]:px-1 [&_h1]:text-[16px] [&_h1]:font-bold [&_h2]:text-[15px] [&_h2]:font-bold [&_h3]:text-[14px] [&_h3]:font-semibold',
  '[&_hr]:my-2 [&_hr]:border-line [&_li]:my-0.5 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-0 [&_p+p]:mt-1.5 [&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap',
  '[&_table]:my-1 [&_table]:border-collapse [&_td]:border [&_td]:border-line [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-line [&_th]:bg-fill [&_th]:px-2 [&_th]:py-1',
  '[&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5',
].join(' ')

/** 서식(굵게, 목록, 표 등)이 들어 있는 글을 정리해서 그대로 보여 준다. 태그가 없으면 줄바꿈만 살려 보여 준다 */
export function RichText({ text, className }: Props) {
  const html = useMemo(() => (looksLikeHtml(text) ? sanitizeHtml(text) : null), [text])

  if (html === null) return <div className={cn('whitespace-pre-wrap', className)}>{text}</div>

  return (
    <div
      className={cn(richTextClass, className)}
      // 정리한 HTML 만 넣는다 (허용 목록 밖의 태그와 속성은 sanitizeHtml 에서 제거)
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
