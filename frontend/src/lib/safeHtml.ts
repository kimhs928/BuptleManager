/**
 * Biz 에서 온 HTML(계약 요약 등)을 화면에 그릴 수 있게 정리한다.
 * 허용한 태그와 속성만 남기고 나머지는 버린다. 스크립트, 이벤트 속성, 외부 이미지는 남기지 않는다.
 */

/** 모양만 있는 태그. 허용하지 않은 태그는 태그만 벗기고 안의 글자는 남긴다 */
const ALLOWED_TAGS = new Set([
  'p', 'br', 'div', 'span', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 'sub', 'sup',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'hr', 'a',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
])

/** 안의 글자까지 통째로 버리는 태그 */
const DROPPED_TAGS = new Set(['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'form', 'input', 'button', 'textarea', 'select', 'svg', 'math', 'img', 'video', 'audio', 'noscript', 'template'])

/** 남겨 두는 스타일. 글자 모양과 정렬만 적용한다 */
const ALLOWED_STYLES = new Set(['color', 'background-color', 'font-weight', 'font-style', 'text-decoration', 'text-align'])
const SAFE_STYLE_VALUE = /^[#\w\s(),.%-]+$/

const SAFE_HREF = /^(https?:|mailto:|tel:)/i
const CELL_TAGS = new Set(['th', 'td'])
const SPAN_ATTRS = new Set(['colspan', 'rowspan'])

function cleanStyle(style: string): string {
  return style
    .split(';')
    .map((decl) => decl.split(':').map((s) => s.trim()))
    .filter(([name, value]) => name && value && ALLOWED_STYLES.has(name.toLowerCase()) && SAFE_STYLE_VALUE.test(value))
    .map(([name, value]) => `${name.toLowerCase()}: ${value}`)
    .join('; ')
}

function clean(node: Node, out: Document): Node | null {
  if (node.nodeType === Node.TEXT_NODE) return out.createTextNode(node.textContent ?? '')
  if (node.nodeType !== Node.ELEMENT_NODE) return null

  const el = node as Element
  const tag = el.tagName.toLowerCase()
  if (DROPPED_TAGS.has(tag)) return null

  const frag = out.createDocumentFragment()
  const children = (parent: Node) => {
    el.childNodes.forEach((child) => {
      const c = clean(child, out)
      if (c) parent.appendChild(c)
    })
  }

  if (!ALLOWED_TAGS.has(tag)) {
    children(frag)
    return frag
  }

  const copy = out.createElement(tag)
  const style = cleanStyle(el.getAttribute('style') ?? '')
  if (style) copy.setAttribute('style', style)
  if (tag === 'a') {
    const href = el.getAttribute('href')?.trim()
    if (href && SAFE_HREF.test(href)) {
      copy.setAttribute('href', href)
      copy.setAttribute('target', '_blank')
      copy.setAttribute('rel', 'noopener noreferrer')
    }
  }
  if (CELL_TAGS.has(tag)) {
    SPAN_ATTRS.forEach((a) => {
      const v = el.getAttribute(a)
      if (v && /^\d{1,2}$/.test(v)) copy.setAttribute(a, v)
    })
  }
  children(copy)
  return copy
}

/** HTML 문자열을 정리한 HTML 문자열로 바꾼다 */
export function sanitizeHtml(html: string): string {
  const parsed = new DOMParser().parseFromString(html, 'text/html')
  const out = document.implementation.createHTMLDocument('')
  const root = out.createElement('div')
  parsed.body.childNodes.forEach((child) => {
    const c = clean(child, out)
    if (c) root.appendChild(c)
  })
  return root.innerHTML
}

/** HTML 태그가 들어 있는 문자열인지. 없으면 일반 글자로 보여 준다 */
export function looksLikeHtml(text: string): boolean {
  return /<\/?[a-z][a-z0-9]*(\s[^>]*)?>/i.test(text)
}
