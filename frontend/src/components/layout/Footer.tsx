import { cn } from '../../lib/cn'
import { texts } from '../../texts'

/** 공통 하단 문구 (저작권 · 접근 안내 · 버전) */
export function Footer({ className }: { className?: string }) {
  const { copyright, authorizedOnly, version } = texts.common.footer
  return (
    <footer className={cn('flex flex-wrap justify-center gap-x-4 px-6 text-[11px] text-ink-4', className)}>
      <span>{copyright}</span>
      <span>{authorizedOnly}</span>
      <span>{version}</span>
    </footer>
  )
}
