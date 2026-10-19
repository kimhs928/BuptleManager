import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * 모달 접근성 처리.
 * 열릴 때 포커스를 안으로 옮기고, Esc로 닫고, Tab을 모달 안에 가두고, 닫힐 때 원래 위치로 되돌린다.
 * onClose가 매 렌더링마다 바뀌어도 이벤트 리스너를 다시 등록하지 않는다.
 */
export function useModalFocus(dialogRef: RefObject<HTMLElement | null>, onClose: () => void) {
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const focusable = () => Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => !el.hasAttribute('disabled'))
    // 제목 옆 닫기 버튼보다 첫 입력 요소를 우선 포커스한다
    const first = dialog.querySelector<HTMLElement>('input:not([readonly]), select, textarea:not([readonly])') ?? focusable()[0]
    first?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onCloseRef.current()
      if (e.key !== 'Tab') return
      const items = focusable()
      if (items.length === 0) return
      const head = items[0]
      const tail = items[items.length - 1]
      if (e.shiftKey && document.activeElement === head) {
        e.preventDefault()
        tail.focus()
      } else if (!e.shiftKey && document.activeElement === tail) {
        e.preventDefault()
        head.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previous?.focus()
    }
  }, [dialogRef])
}
