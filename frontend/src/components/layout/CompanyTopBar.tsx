import { Badge } from '../ui'
import { platformLabel } from '../../lib/platform'
import type { ServicePlatform } from '../../lib/platform'
import { texts } from '../../texts'

const t = texts.company

type Props = {
  platform: ServicePlatform
  companyName: string
  schema: string
  mainHref: string
  /** 현재 위치. 마지막 항목이 현재 화면 */
  trail: { label: string; href?: string }[]
}

/** 고객사 선택 후 화면의 상단 바 (경로 · 서비스 · 선택 고객사) */
export function CompanyTopBar({ platform, companyName, schema, mainHref, trail }: Props) {
  const crumbs = [{ label: t.breadcrumb.main, href: mainHref }, ...trail]
  return (
    <header className="flex h-[58px] shrink-0 items-center justify-between gap-4 border-b border-divider bg-surface/85 px-7">
      <nav aria-label={t.breadcrumb.label} className="flex items-center gap-1.5 text-[13px] text-ink-4">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1
          return (
            <span key={c.label} className="inline-flex items-center gap-1.5">
              {i > 0 && <span aria-hidden="true">›</span>}
              {c.href && !last ? (
                <a href={c.href} className="hover:underline">
                  {c.label}
                </a>
              ) : (
                <span aria-current={last ? 'page' : undefined} className={last ? 'font-medium text-ink' : undefined}>
                  {c.label}
                </span>
              )}
            </span>
          )
        })}
      </nav>
      <div className="flex items-center gap-2.5">
        <Badge tone={platform === 'BUPTLE_BIZ' ? 'biz' : 'nova'}>{platformLabel[platform]}</Badge>
        <span className="inline-flex h-8 items-center gap-2 rounded-full bg-[#f2f2f5] px-3 text-[13px]">
          <span className="font-medium">{companyName}</span>
          <span className="text-ink-4">{schema}</span>
        </span>
        <a href={mainHref} className="inline-flex h-8 items-center rounded-ctl border border-line-strong bg-surface px-3.5 text-[13px] font-medium text-ink hover:bg-hover">
          {t.switchCompany}
        </a>
      </div>
    </header>
  )
}
