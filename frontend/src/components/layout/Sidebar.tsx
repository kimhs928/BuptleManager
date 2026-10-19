import { useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { texts } from '../../texts'
import { MOCK_ACCOUNT } from '../../mocks/auth'
import { BuildingIcon, ChevronDownIcon, ChevronRightIcon, HistoryIcon, ImageIcon, SearchIcon, SlidersIcon, SwapIcon } from '../icons'

const t = texts.company.sidebar
const LOGO_KEY = 'bm-logo'

function readLogo(): string {
  try {
    return localStorage.getItem(LOGO_KEY) ?? ''
  } catch {
    return ''
  }
}

const navItem = 'flex h-[34px] items-center gap-2.5 rounded-ctl px-2.5 text-[13.5px] font-semibold text-ink hover:bg-fill'

function NavLink({ href, icon, children, trailing, current }: { href: string; icon: ReactNode; children: ReactNode; trailing?: ReactNode; current?: boolean }) {
  return (
    <a href={href} aria-current={current ? 'page' : undefined} className={cn(navItem, current && 'bg-surface shadow-seg hover:bg-surface')}>
      {icon}
      <span className="flex-1">{children}</span>
      {trailing}
    </a>
  )
}

/** 로고 이미지 (클릭해서 변경, 브라우저에 저장) */
function LogoUploader() {
  const [logo, setLogo] = useState(readLogo)

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const src = String(reader.result)
      try {
        localStorage.setItem(LOGO_KEY, src)
      } catch {
        // 저장 공간이 없어도 현재 화면에는 반영한다
      }
      setLogo(src)
    }
    reader.readAsDataURL(file)
  }

  return (
    <label title={t.logoTitle} className="relative inline-flex size-8 shrink-0 cursor-pointer overflow-hidden rounded-ctl focus-within:outline focus-within:outline-3 focus-within:outline-primary/40">
      <input type="file" accept="image/*" aria-label={t.logoUpload} onChange={onChange} className="absolute size-px opacity-0" />
      {logo ? (
        <img src={logo} alt={t.logoAlt} className="size-8 object-cover" />
      ) : (
        <span className="inline-flex size-8 items-center justify-center rounded-ctl border-[1.5px] border-dashed border-ink-5 bg-surface text-ink-5">
          <ImageIcon size={16} />
        </span>
      )}
    </label>
  )
}

const features: { key: keyof typeof t.features; href: string }[] = [
  { key: 'contract', href: '?contract' },
  { key: 'counsel', href: '#counsel' },
  { key: 'litigation', href: '#litigation' },
  { key: 'user', href: '#user' },
  { key: 'errorReport', href: '#error-report' },
]

type Props = {
  /** 메인(고객사 선택) 화면 주소 */
  mainHref: string
  /** 현재 화면이 속한 메뉴 */
  active?: 'company' | 'contract'
}

/** 고객사 선택 후 화면의 좌측 메뉴 */
export function Sidebar({ mainHref, active = 'company' }: Props) {
  const [open, setOpen] = useState(true)

  return (
    <aside className="flex w-[248px] shrink-0 flex-col gap-px border-r border-[#e4e4ec] bg-[#f6f6fa] px-2.5 pb-3.5 pt-4">
      <div className="flex items-center gap-1 pb-3.5 pl-2.5 pr-1.5 pt-0.5">
        <span className="flex min-w-0 flex-1 items-center gap-2.5">
          <LogoUploader />
          <a href={mainHref} className="min-w-0 truncate text-[19px] font-bold tracking-[-0.02em] text-ink">
            {texts.common.appName}
          </a>
        </span>
        <button type="button" aria-label={t.search} className="inline-flex size-[30px] items-center justify-center rounded-ctl text-ink-2 hover:bg-fill">
          <SearchIcon size={16} />
        </button>
        <a href={mainHref} aria-label={t.switchCompany} title={t.switchCompany} className="inline-flex size-[30px] items-center justify-center rounded-ctl text-ink-2 hover:bg-fill">
          <SwapIcon size={16} />
        </a>
      </div>

      <NavLink href="?company" current={active === 'company'} icon={<BuildingIcon size={16} />}>
        {t.companyInfo}
      </NavLink>

      <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className={cn(navItem, 'border-0 bg-transparent text-left')}>
        <SlidersIcon size={16} />
        <span className="flex-1">{t.mainFeatures}</span>
        <ChevronDownIcon size={14} className={cn('shrink-0 text-ink-4 transition-transform', !open && '-rotate-90')} />
      </button>
      {open && (
        <div className="ml-[18px] mt-0.5 mb-1.5 flex flex-col gap-px border-l border-line-strong/70 pl-2.5">
          {features.map((f) => (
            <a
              key={f.key}
              href={f.href}
              aria-current={active === f.key ? 'page' : undefined}
              className={cn('flex h-8 items-center rounded-ctl px-2.5 text-[13px] font-medium hover:bg-fill', active === f.key ? 'bg-surface text-ink shadow-seg hover:bg-surface' : 'text-ink-3')}
            >
              {t.features[f.key]}
            </a>
          ))}
        </div>
      )}

      <NavLink href="#config" icon={<SlidersIcon size={16} />} trailing={<ChevronRightIcon size={14} className="text-ink-5" />}>
        {t.config}
      </NavLink>
      <NavLink href="#history" icon={<HistoryIcon size={16} />} trailing={<ChevronRightIcon size={14} className="text-ink-5" />}>
        {t.history}
      </NavLink>

      <span className="flex-1" />
      <div className="flex flex-col gap-px border-t border-[#e4e4ec] px-2.5 pb-0.5 pt-3">
        <span className="text-[13px] font-semibold">{MOCK_ACCOUNT.name}</span>
        <span className="text-[11.5px] text-ink-4">{MOCK_ACCOUNT.role}</span>
      </div>
    </aside>
  )
}
