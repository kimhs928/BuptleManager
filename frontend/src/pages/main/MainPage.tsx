import { useState } from 'react'
import type { ReactNode } from 'react'
import { Header } from '../../components/layout/Header'
import { Button, Card, NoticeBanner, OptionList, PlatformDot, SearchInput, SectionLabel, SegmentedControl } from '../../components/ui'
import { platformLabel } from '../../lib/platform'
import type { ServicePlatform } from '../../lib/platform'
import { MOCK_ACCOUNT } from '../../mocks/auth'
import { MOCK_COMPANIES, MOCK_CONFIG_MISMATCH, MOCK_RECENT } from '../../mocks/companies'
import { texts } from '../../texts'

const t = texts.main

const platforms: ServicePlatform[] = ['BUPTLE_BIZ', 'BUPTLE_NOVA']

const searchIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16" y2="16" />
  </svg>
)

const configIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
)

const historyIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <polyline points="3 3 3 9 9 9" />
    <polyline points="12 7 12 12 16 14" />
  </svg>
)

/** 바로가기 타일 */
function ShortcutTile({ href, icon, iconClass, title, description }: { href: string; icon: ReactNode; iconClass: string; title: string; description: string }) {
  return (
    <a href={href} className="flex items-center gap-3 px-4 py-3.5 text-ink hover:bg-hover">
      <span className={`inline-flex size-[26px] shrink-0 items-center justify-center rounded-md text-white ${iconClass}`}>{icon}</span>
      <span className="flex min-w-0 flex-1 flex-col gap-px">
        <span className="text-[13px] font-medium">{title}</span>
        <span className="text-xs text-ink-4">{description}</span>
      </span>
      <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="var(--color-line-strong)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
        <polyline points="2 1 6 6 2 11" />
      </svg>
    </a>
  )
}

type Props = {
  /** 컨피그 불일치 알림 노출 */
  configMismatch?: boolean
}

/** 메인 화면 (고객사 선택) */
export function MainPage({ configMismatch = false }: Props) {
  const [platform, setPlatform] = useState<ServicePlatform>('BUPTLE_BIZ')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const q = query.trim().toLowerCase()
  const filtered = MOCK_COMPANIES[platform].filter((c) => !q || c.schema.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
  const hasSelection = q !== '' && filtered.some((c) => c.schema === selected)

  const changePlatform = (next: ServicePlatform) => {
    setPlatform(next)
    setSelected(null)
    setQuery('')
  }

  const pickRecent = (r: (typeof MOCK_RECENT)[number]) => {
    setPlatform(r.platform)
    setSelected(r.schema)
    setQuery(r.schema)
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-bg">
      <Header userLabel={`${MOCK_ACCOUNT.name} · ${MOCK_ACCOUNT.role}`} hasNotice={configMismatch} />

      {configMismatch && (
        <div className="px-8 pt-4">
          <NoticeBanner
            title={t.configMismatch.title}
            count={t.configMismatch.count(MOCK_CONFIG_MISMATCH.count)}
            actionLabel={t.configMismatch.action}
            onAction={() => undefined}
          >
            {t.configMismatch.message(platformLabel[MOCK_CONFIG_MISMATCH.platform], MOCK_CONFIG_MISMATCH.lastBatchAt)}
          </NoticeBanner>
        </div>
      )}

      <main className="flex flex-1 justify-center px-8 pb-10 pt-11">
        <div className="flex w-full max-w-[880px] flex-col gap-8">
          <section aria-labelledby="pick-title" className="flex flex-col gap-4">
            <h1 id="pick-title" className="m-0 text-[30px] font-bold leading-tight tracking-[-0.02em]">
              {configMismatch ? t.title : t.title}
            </h1>

            <div>
              <SegmentedControl
                label={t.platformLabel}
                value={platform}
                onChange={changePlatform}
                options={platforms.map((p) => ({ value: p, label: platformLabel[p], leading: <PlatformDot platform={p} /> }))}
              />
            </div>

            <form role="search" className="flex items-center gap-2" onSubmit={(e) => e.preventDefault()}>
              <SearchInput aria-label={t.search.label} placeholder={t.search.placeholder} value={query} onChange={(e) => setQuery(e.target.value)} />
              <Button type="submit" variant="dark" icon={searchIcon} className="rounded-[10px] font-semibold">
                {texts.common.action.search}
              </Button>
            </form>

            {/* 검색어를 입력했을 때만 고객사 목록 노출 */}
            {q && (
              <div className="flex flex-col gap-1.5">
                <SectionLabel>{t.list.resultCount(filtered.length)}</SectionLabel>
                <OptionList
                  label={t.list.label}
                  options={filtered.map((c) => ({
                    id: c.schema,
                    title: c.name,
                    subtitle: `${c.schema} · ${c.domain}`,
                    trailing: t.list.users(c.users),
                  }))}
                  selectedId={selected}
                  onSelect={setSelected}
                  emptyMessage={t.list.empty}
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <span className="pl-3 text-xs text-ink-4">{t.recent}</span>
              {MOCK_RECENT.map((r) => (
                <button
                  key={r.schema}
                  type="button"
                  onClick={() => pickRecent(r)}
                  className="inline-flex h-[26px] items-center gap-1.5 rounded-full bg-fill px-2.5 text-xs text-ink"
                >
                  <PlatformDot platform={r.platform} />
                  {r.schema}
                </button>
              ))}
              <span className="flex-1" />
              {/* TODO: 고객사 정보 화면 연결 */}
              <Button disabled={!hasSelection} onClick={() => undefined} className="text-[13px]">
                {t.enter}
              </Button>
            </div>
          </section>

          <section className="flex flex-col gap-1.5">
            <SectionLabel>{t.shortcuts.title}</SectionLabel>
            <Card className="grid grid-cols-2 divide-x divide-divider overflow-hidden">
              <ShortcutTile href="#config" icon={configIcon} iconClass="bg-success" {...t.shortcuts.config} />
              <ShortcutTile href="#history" icon={historyIcon} iconClass="bg-primary" {...t.shortcuts.history} />
            </Card>
          </section>
        </div>
      </main>

      <footer className="px-6 pb-6 text-center text-[11px] text-ink-4">
        {[texts.common.footer.copyright, texts.common.footer.authorizedOnly, texts.common.footer.version].join(' · ')}
      </footer>
    </div>
  )
}
