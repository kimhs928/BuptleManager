import { useState } from 'react'
import { CompanyTopBar } from '../../components/layout/CompanyTopBar'
import { Sidebar } from '../../components/layout/Sidebar'
import { CloseIcon } from '../../components/icons'
import { cn } from '../../lib/cn'
import { MOCK_COMPANY_DETAIL, MOCK_CONFIGS, MOCK_LIVE_USERS } from '../../mocks/companyDetail'
import type { LiveUser } from '../../mocks/companyDetail'
import { texts } from '../../texts'
import { BasicInfoTab } from './BasicInfoTab'
import { ConfigTab } from './ConfigTab'
import { LiveUsersTab } from './LiveUsersTab'

const t = texts.company

export type CompanyTab = 'basic' | 'config' | 'users'

const tabKeys: Record<CompanyTab, string> = { basic: 'basic', config: 'config', users: 'liveUsers' }

type Props = {
  initialTab?: CompanyTab
  /** 메인(고객사 선택) 화면 주소 */
  mainHref: string
}

function Dot({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn('inline-block size-2 shrink-0 rounded-full', className)} />
}

/** 고객사 정보 화면 (기본 정보 · 컨피그 · 실시간 접속 유저) */
export function CompanyPage({ initialTab = 'basic', mainHref }: Props) {
  const company = MOCK_COMPANY_DETAIL
  const [tab, setTab] = useState<CompanyTab>(initialTab)
  const [users, setUsers] = useState<LiveUser[]>(MOCK_LIVE_USERS)
  const [toast, setToast] = useState('')

  const counts: Record<CompanyTab, number | undefined> = { basic: undefined, config: MOCK_CONFIGS.length, users: users.length }

  const changeTab = (next: CompanyTab) => {
    setTab(next)
    // 새로고침해도 같은 탭이 열리도록 주소만 갱신한다
    window.history.replaceState(null, '', next === 'basic' ? '?company' : `?company&tab=${next}`)
  }

  const forceLogout = (ids: string[], ticket: string) => {
    const targets = users.filter((u) => ids.includes(u.id))
    setUsers((prev) => prev.filter((u) => !ids.includes(u.id)))
    setToast(t.toast.forceLogoutDone(targets.length, targets.map((u) => u.name).join(', '), ticket))
  }

  const tabLabel = t.tabs[tabKeys[tab] as keyof typeof t.tabs]

  return (
    <div className="flex min-h-screen w-full bg-bg">
      <Sidebar mainHref={mainHref} />

      <div className="flex min-w-0 flex-1 flex-col">
        <CompanyTopBar
          platform={company.platform}
          companyName={company.name}
          schema={company.schema}
          mainHref={mainHref}
          trail={[{ label: t.breadcrumb.companyInfo, href: '?company' }, { label: tabLabel }]}
        />

        <main className="flex flex-1 flex-col gap-6 px-9 pb-10 pt-7">
          <div className="flex flex-col gap-[18px]">
            {toast && (
              <div role="status" className="flex items-center gap-2.5 rounded-xl border border-success-line bg-success-soft px-3.5 py-2.5 text-[13px] text-success-ink">
                <Dot className="bg-success" />
                <span className="flex-1">{toast}</span>
                <a href="#history" className="font-medium text-link hover:underline">
                  {t.toast.history}
                </a>
                <button type="button" aria-label={t.toast.close} onClick={() => setToast('')} className="inline-flex size-6 items-center justify-center rounded-md text-success-ink hover:bg-success-line/60">
                  <CloseIcon size={14} />
                </button>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-3">
                <Dot className={company.active ? 'bg-success' : 'bg-line-strong'} />
                {company.active ? t.summary.active : t.summary.inactive}
              </span>
              <h1 className="m-0 text-[26px] font-bold leading-tight tracking-[-0.02em]">{company.name}</h1>
              <dl className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
                {(
                  [
                    [t.summary.users, t.summary.count(company.users)],
                    [t.summary.schema, company.schema],
                    [t.summary.domain, company.domain],
                  ] as const
                ).map(([label, value], i) => (
                  <div key={label} className="inline-flex items-center gap-3">
                    {i > 0 && <span aria-hidden="true" className="size-[3px] rounded-full bg-ink-5" />}
                    <span className="inline-flex items-center gap-1.5">
                      <dt className="text-ink-4">{label}</dt>
                      <dd className="m-0 font-medium tabular-nums text-ink">{value}</dd>
                    </span>
                  </div>
                ))}
              </dl>
            </div>

            <div role="tablist" aria-label={t.tabs.label} className="flex gap-6 border-b border-divider">
              {(Object.keys(tabKeys) as CompanyTab[]).map((key) => {
                const active = key === tab
                const count = counts[key]
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    id={`company-tab-${key}`}
                    aria-selected={active}
                    aria-controls="company-tabpanel"
                    onClick={() => changeTab(key)}
                    className={cn(
                      '-mb-px inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 py-2.5 text-sm',
                      active ? 'border-primary font-semibold text-ink' : 'border-transparent font-medium text-ink-3 hover:text-ink',
                    )}
                  >
                    {t.tabs[tabKeys[key] as keyof typeof t.tabs]}
                    {count !== undefined && <span className="rounded-full bg-fill px-[7px] text-[11px] font-semibold leading-[18px] text-ink-2">{count}</span>}
                  </button>
                )
              })}
            </div>
          </div>

          <div id="company-tabpanel" role="tabpanel" aria-labelledby={`company-tab-${tab}`}>
            {tab === 'basic' && <BasicInfoTab company={company} liveUserCount={users.length} />}
            {tab === 'config' && <ConfigTab />}
            {tab === 'users' && <LiveUsersTab company={company} users={users} onForceLogout={forceLogout} />}
          </div>
        </main>
      </div>
    </div>
  )
}
