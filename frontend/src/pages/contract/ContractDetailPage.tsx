import { useState } from 'react'
import { CloseIcon, SearchIcon } from '../../components/icons'
import { CompanyShell } from '../../components/layout/CompanyShell'
import { Button } from '../../components/ui'
import { cn } from '../../lib/cn'
import { MOCK_CONTRACT_DETAIL, MOCK_EMAILS, MOCK_HISTORY, MOCK_HISTORY_USERS, MOCK_MEMBERS, MOCK_WORKFLOW } from '../../mocks/contract'
import type { ContractDetail, ContractMember, HistoryRow, Workflow } from '../../mocks/contract'
import { texts } from '../../texts'
import { BasicTab } from './BasicTab'
import { HistoryTab } from './HistoryTab'
import { MembersTab } from './MembersTab'
import { StatusDot } from './shared'
import { WorkflowTab } from './WorkflowTab'

const t = texts.contract

/** 기본 정보 · 참여 유저 · 워크플로우·히스토리 */
export type ContractTab = 'basic' | 'members' | 'workflow'

const tabKeys: ContractTab[] = ['basic', 'members', 'workflow']

type Props = {
  initialTab?: ContractTab
}

const dot = <span aria-hidden="true" className="size-[3px] rounded-full bg-ink-5" />

/** 계약 상세 */
export function ContractDetailPage({ initialTab = 'basic' }: Props) {
  const [tab, setTab] = useState<ContractTab>(initialTab)
  const [contract, setContract] = useState<ContractDetail>(MOCK_CONTRACT_DETAIL)
  const [members, setMembers] = useState<ContractMember[]>(MOCK_MEMBERS)
  const [workflow, setWorkflow] = useState<Workflow>(MOCK_WORKFLOW)
  const [history, setHistory] = useState<HistoryRow[]>(MOCK_HISTORY)
  const [toast, setToast] = useState('')
  const [query, setQuery] = useState(MOCK_CONTRACT_DETAIL.id)

  const changeTab = (next: ContractTab) => {
    setTab(next)
    // 새로고침해도 같은 탭이 열리도록 주소만 갱신한다
    window.history.replaceState(null, '', `?contract=${contract.id}${next === 'basic' ? '' : `&tab=${next}`}`)
  }

  const recentHistory = [...history]
    .filter((h) => !h.deleted)
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, 3)

  return (
    <CompanyShell active="contract" trail={[{ label: t.breadcrumb.features }, { label: t.breadcrumb.contract, href: '?contract' }, { label: contract.id }]}>
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
        <div className="flex flex-col gap-[18px]">
          {toast && (
            <div role="status" className="flex items-center gap-3 rounded-xl border border-success-line bg-success-soft px-3.5 py-[11px] text-[13px] text-success-ink">
              <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-success" />
              <span className="flex-1 leading-[1.45]">{toast}</span>
              <button type="button" onClick={() => { changeTab('workflow'); setToast('') }} className="font-medium underline">
                {t.toast.history}
              </button>
              <button type="button" aria-label={t.toast.close} onClick={() => setToast('')} className="inline-flex size-6 items-center justify-center rounded-md hover:bg-success-line/60">
                <CloseIcon size={13} />
              </button>
            </div>
          )}

          <form
            role="search"
            className="flex flex-wrap items-center gap-2.5"
            onSubmit={(e) => {
              e.preventDefault()
              window.location.assign(`?contract&q=${encodeURIComponent(query.trim())}`)
            }}
          >
            <label className="relative block max-w-[420px] flex-1">
              <span className="pointer-events-none absolute left-[11px] top-2.5 inline-flex text-ink-4">
                <SearchIcon size={15} strokeWidth={2.2} />
              </span>
              <input
                type="search"
                autoComplete="off"
                aria-label={t.header.searchLabel}
                placeholder={t.header.searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-9 w-full rounded-[10px] border-0 bg-[#ebebf0] pl-[34px] pr-3 text-[13.5px] text-ink placeholder:text-ink-4 focus:outline-none focus:shadow-[0_0_0_3px_rgb(35_100_170/0.22)]"
              />
            </label>
            <Button type="submit" variant="dark" icon={<SearchIcon size={14} strokeWidth={2.4} />} className="h-9 rounded-[10px] px-[18px] text-[13.5px] font-semibold">
              {t.header.searchSubmit}
            </Button>
            <span className="text-xs text-ink-4">{t.header.searchHint}</span>
          </form>

          <div className="flex min-w-0 flex-col gap-2">
            <h1 className="m-0 text-[26px] font-bold leading-tight tracking-[-0.02em]">{contract.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-[13px]">
              <span className="inline-flex items-center gap-1.5">
                <span className="text-ink-4">ID</span>
                <span className="font-mono text-[12.5px] font-medium">{contract.id}</span>
              </span>
              {dot}
              <span className="inline-flex items-center gap-1.5">
                <span className="text-ink-4">{t.header.stage}</span>
                <span className="font-medium">
                  <StatusDot status={contract.status} className="text-ink" />
                </span>
              </span>
              {dot}
              <span className="inline-flex items-center gap-1.5">
                <span className="text-ink-4">{t.header.kind}</span>
                <span className="font-medium">{contract.kind}</span>
              </span>
              {dot}
              <span className="inline-flex items-center gap-1.5">
                <span className="text-ink-4">{t.header.signType}</span>
                <span className="font-medium">{contract.signType}</span>
              </span>
              {contract.deleted && <span className="rounded-full border border-danger-line bg-danger-soft px-[7px] py-px text-[11px] font-medium text-danger-ink">{t.header.deleted}</span>}
            </div>
          </div>

          <div role="tablist" aria-label={t.header.tabsLabel} className="flex gap-6 border-b border-line-strong">
            {tabKeys.map((key) => {
              const active = key === tab
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  id={`contract-tab-${key}`}
                  aria-selected={active}
                  aria-controls="contract-tabpanel"
                  onClick={() => changeTab(key)}
                  className={cn('-mb-px inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 py-2.5 text-sm', active ? 'border-primary font-semibold text-ink' : 'border-transparent font-medium text-ink-3 hover:text-ink')}
                >
                  {t.header.tabs[key]}
                  {key === 'members' && <span className="text-xs font-normal tabular-nums text-ink-5">{members.length}</span>}
                </button>
              )
            })}
          </div>
        </div>

        <div id="contract-tabpanel" role="tabpanel" aria-labelledby={`contract-tab-${tab}`}>
          {tab === 'basic' && (
            <BasicTab
              contract={contract}
              recentHistory={recentHistory}
              historyCount={history.length}
              onSave={(next, count, ticket) => {
                setContract(next)
                setToast(t.toast.basicSaved(count, ticket))
              }}
              onShowHistory={() => changeTab('workflow')}
              onShowWorkflow={() => changeTab('workflow')}
            />
          )}
          {tab === 'members' && (
            <MembersTab
              members={members}
              onEdit={(next, ticket) => {
                setMembers((prev) => prev.map((m) => (m.id === next.id ? next : m)))
                setToast(t.toast.memberSaved(next.name, ticket))
              }}
              onAdd={(member, ticket) => {
                setMembers((prev) => [...prev, member])
                setToast(t.toast.memberAdded(member.name, ticket))
              }}
            />
          )}
          {tab === 'workflow' && (
            <div className="flex flex-col gap-6">
              <WorkflowTab
                workflow={workflow}
                history={history}
                onSave={(next, count, ticket) => {
                  setWorkflow(next)
                  setToast(t.toast.workflowSaved(count, ticket))
                }}
              />
              <HistoryTab
                history={history}
                emails={MOCK_EMAILS}
                members={MOCK_HISTORY_USERS}
                onSaveRow={(next, ticket) => {
                  setHistory((prev) => prev.map((h) => (h.id === next.id ? next : h)))
                  setToast(t.toast.historySaved(next.action, ticket))
                }}
              />
            </div>
          )}
        </div>
      </div>
    </CompanyShell>
  )
}
