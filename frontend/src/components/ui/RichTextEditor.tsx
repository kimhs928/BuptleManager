import { useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/cn'
import { looksLikeHtml, plainToHtml, sanitizeHtml } from '../../lib/safeHtml'
import { richTextClass } from './RichText'

type Props = {
  id?: string
  /** 일반 글자 또는 HTML */
  value: string
  onChange: (html: string) => void
  /** 접근성 이름 (aria-label). Field 의 label 로 이름이 붙으면 생략 */
  label?: string
  minHeight?: number
}

const TOOLS: { label: string; command: string; text: string; className?: string }[] = [
  { label: '굵게', command: 'bold', text: 'B', className: 'font-bold' },
  { label: '기울임', command: 'italic', text: 'I', className: 'italic' },
  { label: '밑줄', command: 'underline', text: 'U', className: 'underline' },
  { label: '글머리 기호 목록', command: 'insertUnorderedList', text: '•' },
  { label: '번호 목록', command: 'insertOrderedList', text: '1.' },
]

const toHtml = (value: string) => (looksLikeHtml(value) ? sanitizeHtml(value) : plainToHtml(value))

/**
 * 서식(굵게, 기울임, 목록 등)이 보이는 채로 고치는 입력 영역.
 * 값은 정리(sanitize)한 HTML 로 내보낸다. 고치지 않으면 onChange 를 부르지 않아 원래 값이 그대로 유지된다.
 */
export function RichTextEditor({ id, value, onChange, label, minHeight = 76 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  // 처음 한 번만 넣는다. 값이 바뀔 때마다 다시 넣으면 입력 중에 커서가 맨 앞으로 튄다
  const [initialHtml] = useState(() => toHtml(value))

  // 바깥에서 값이 바뀌면(되돌리기 등) 화면도 맞춘다. 입력 중일 때는 커서가 튀지 않게 건드리지 않는다
  useEffect(() => {
    const el = ref.current
    if (!el || document.activeElement === el) return
    const next = toHtml(value)
    if (el.innerHTML !== next) el.innerHTML = next
  }, [value])

  const emit = () => {
    const el = ref.current
    if (el) onChange(sanitizeHtml(el.innerHTML))
  }

  const run = (command: string) => {
    ref.current?.focus()
    document.execCommand(command)
    emit()
  }

  return (
    <div className="flex flex-col">
      <div role="toolbar" aria-label="서식" className="flex gap-1 rounded-t-ctl border border-b-0 border-line-strong bg-fill px-1.5 py-1">
        {TOOLS.map((tool) => (
          <button
            key={tool.command}
            type="button"
            aria-label={tool.label}
            title={tool.label}
            // 버튼을 눌러도 편집 영역의 선택이 풀리지 않게 한다
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => run(tool.command)}
            className={cn('inline-flex size-7 items-center justify-center rounded-md text-[13px] text-ink-2 hover:bg-hover', tool.className)}
          >
            {tool.text}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        id={id}
        role="textbox"
        aria-multiline="true"
        aria-label={label}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        // 붙여 넣을 때는 서식 없이 글자만 넣는다
        onPaste={(e) => {
          e.preventDefault()
          document.execCommand('insertText', false, e.clipboardData.getData('text/plain'))
        }}
        style={{ minHeight }}
        className={cn(
          'max-h-[200px] w-full overflow-y-auto rounded-b-ctl border border-line-strong bg-surface px-3 py-2.5 text-[13px] leading-normal text-ink',
          'focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_rgb(35_100_170/0.22)]',
          richTextClass,
        )}
        dangerouslySetInnerHTML={{ __html: initialHtml }}
      />
    </div>
  )
}
