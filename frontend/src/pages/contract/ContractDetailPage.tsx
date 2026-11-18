import { useState } from 'react'
import { CloseIcon, SearchIcon } from '../../components/icons'
import { CompanyShell } from '../../components/layout/CompanyShell'
import { Button } from '../../components/ui'
import { useContractBundle } from '../../hooks/useContractBundle'
import { currentCompany, replaceUrl } from '../../lib/selectedCompany'
import { cn } from '../../lib/cn'
import { contractApi } from '../../lib/contractApi'
import type { ContractUpdateBody, HistoryUpdateBody, MemberUpdateBody } from '../../lib/contractApi'
import { localToIso } from '../../lib/apiWrite'
import type { Audit } from '../../lib/apiWrite'
import type { ContractDetail, ContractEmail, ContractMember, HistoryRow, Workflow } from '../../mocks/contract'
import { texts } from '../../texts'
import { BasicTab } from './BasicTab'
import { toContractDetail, toDocs, toEmail, toHistoryRow, toMember, toTemplate, toWorkflow } from './contractAdapter'
import type { ContractDoc, ContractTemplate, WorkflowView } from './contractAdapter'
import { mockStatusOf } from './statusMap'
import { HistoryTab } from './HistoryTab'
import { MembersTab } from './MembersTab'
import { StatusDot } from './shared'
import { WorkflowTab } from './WorkflowTab'

const t = texts.contract

/** 기본 정보 · 참여 유저 · 워크플로우·히스토리 */
export type ContractTab = 'basic' | 'members' | 'workflow'

const tabKeys: ContractTab[] = ['basic', 'members', 'workflow']

type Props = {
  /** 보여 줄 계약 ID */
  contractId: string
  initialTab?: ContractTab
}

const dot = <span aria-hidden="true" className="size-[3px] rounded-full bg-ink-5" />

/** 계약 상세. 기본 정보는 Biz DB 에서 불러온다 */
export function ContractDetailPage({ contractId, initialTab = 'basic' }: Props) {
  const { data, loading, error } = useContractBundle(currentCompany().schema, contractId)
  const l = t.detailLoad

  if (data) {
    return (
      <ContractDetailView
        key={data.detail.contract.id}
        initial={toContractDetail(data.detail)}
        docs={toDocs(data.detail)}
        template={toTemplate(data.detail)}
        initialMembers={data.members.map(toMember)}
        initialHistory={data.history.items.map(toHistoryRow)}
        historyUsers={data.history.users}
        emails={data.emails.map(toEmail)}
        workflowView={toWorkflow(data.workflow)}
        initialTab={initialTab}
      />
    )
  }

  const notFound = error !== null && /찾을 수 없/.test(error)
  return (
    <CompanyShell active="contract" trail={[{ label: t.breadcrumb.features }, { label: t.breadcrumb.contract, href: '/contract' }, { label: contractId }]}>
      <div className="mx-auto w-full max-w-[1100px] py-16 text-center text-[14px] text-ink-3">
        {loading ? <p role="status">{l.loading}</p> : <p role="alert">{notFound ? l.notFound(contractId) : l.error(error ?? '')}</p>}
        {!loading && (
          <a href="/contract" className="mt-4 inline-block text-[13px] text-link hover:underline">
            {t.breadcrumb.contract}
          </a>
        )}
      </div>
    </CompanyShell>
  )
}

type ViewProps = {
  initial: ContractDetail
  docs: ContractDoc[]
  template: ContractTemplate | null
  initialMembers: ContractMember[]
  initialHistory: HistoryRow[]
  historyUsers: string[]
  emails: ContractEmail[]
  workflowView: WorkflowView
  initialTab: ContractTab
}

function ContractDetailView({ initial, docs, template, initialMembers, initialHistory, historyUsers, emails, workflowView, initialTab }: ViewProps) {
  const contractId = initial.id
  const [tab, setTab] = useState<ContractTab>(initialTab)
  const [contract, setContract] = useState<ContractDetail>(initial)
  const [members, setMembers] = useState<ContractMember[]>(initialMembers)
  const [workflow, setWorkflow] = useState<Workflow>(workflowView.workflow)
  const [history, setHistory] = useState<HistoryRow[]>(initialHistory)
  const [toast, setToast] = useState('')
  const [query, setQuery] = useState(contractId)

  const schema = currentCompany().schema

  const saveBasic = async (next: ContractDetail, count: number, audit: Audit) => {
    const body: ContractUpdateBody = { audit }
    if (next.name !== contract.name) body.name = next.name
    if (next.summary !== contract.summary) body.summary = next.summary
    if (next.amount !== contract.amount) body.amount = next.amount
    if (next.lang !== contract.lang) body.lang = next.lang
    if (next.statusCode && next.statusCode !== contract.statusCode) body.statusCode = Number(next.statusCode)
    if (next.startDate !== contract.startDate && next.startDate) body.startDate = next.startDate
    if (next.endDate !== contract.endDate && next.endDate) body.endDate = next.endDate
    if (next.deleted !== contract.deleted) body.deleted = next.deleted
    if (next.createdAt !== contract.createdAt) body.createdAt = localToIso(next.createdAt)
    if (next.updatedAt !== contract.updatedAt) body.updatedAt = localToIso(next.updatedAt)
    if (next.deletedAt !== contract.deletedAt) body.deletedAt = localToIso(next.deletedAt)
    if (next.autoRenew !== contract.autoRenew) body.autoRenew = next.autoRenew
    const res = await contractApi.update(schema, contractId, body)
    setContract((prev) => ({ ...toContractDetail({ contract: res.item, template: null }), kind: prev.kind, signType: prev.signType, grade: prev.grade }))
    setToast(t.toast.basicSaved(res.changeCount || count, audit.ticket))
  }

  const saveMember = async (next: ContractMember, audit: Audit) => {
    const before = members.find((m) => m.id === next.id)
    if (!before) return
    const body: MemberUpdateBody = { audit }
    if (next.name !== before.name) body.name = next.name
    if (next.email !== before.email) body.email = next.email
    if (next.company !== before.company) body.company = next.company
    if (next.dept !== before.dept) body.dept = next.dept
    if (next.phone !== before.phone) body.phone = next.phone
    if (next.lang !== before.lang) body.lang = next.lang
    if (next.roles.join('|') !== before.roles.join('|')) body.roles = next.roles
    if (next.perm.join('|') !== before.perm.join('|')) body.perm = next.perm
    if (next.signMethod !== before.signMethod) body.signMethod = next.signMethod
    if (next.signType !== before.signType) body.signType = next.signType
    if (next.signStatus !== before.signStatus) body.signStatus = next.signStatus
    if (next.joinedAt !== before.joinedAt) body.joinedAt = localToIso(next.joinedAt)
    if (next.updatedAt !== before.updatedAt) body.updatedAt = localToIso(next.updatedAt)
    if (next.deleted !== before.deleted) body.deleted = next.deleted
    if (next.deletedAt !== before.deletedAt) body.deletedAt = localToIso(next.deletedAt)
    const res = await contractApi.updateMember(schema, contractId, next.id, body)
    const saved = toMember(res.item)
    setMembers((prev) => prev.map((m) => (m.id === saved.id ? saved : m)))
    setToast(t.toast.memberSaved(saved.name, audit.ticket))
  }

  const addMember = async (member: ContractMember, audit: Audit) => {
    const res = await contractApi.addMember(schema, contractId, {
      kind: member.kind, name: member.name, email: member.email, company: member.company, dept: member.dept, phone: member.phone,
      roles: member.roles, perm: member.perm, lang: member.lang, signMethod: member.signMethod, signType: member.signType, audit,
    })
    const saved = toMember(res.item)
    setMembers((prev) => [...prev, saved])
    setToast(t.toast.memberAdded(saved.name, audit.ticket))
  }

  const saveHistory = async (next: HistoryRow, audit: Audit) => {
    const before = history.find((h) => h.id === next.id)
    if (!before) return
    const body: HistoryUpdateBody = { audit }
    if (next.comment !== before.comment) body.comment = next.comment
    if (next.user !== before.user) body.user = next.user
    if (next.at !== before.at) body.at = localToIso(next.at.replace(' ', 'T'))
    if (next.deleted !== before.deleted) body.deleted = next.deleted
    const res = await contractApi.updateHistory(schema, contractId, next.id, body)
    const saved = toHistoryRow(res.item)
    setHistory((prev) => prev.map((h) => (h.id === saved.id ? saved : h)))
    setToast(t.toast.historySaved(saved.action, audit.ticket))
  }

  const saveWorkflow = async (next: Workflow, count: number, audit: Audit) => {
    const attrs = next.attrs
      .filter((a, i) => a.value.join('|') !== workflow.attrs[i]?.value.join('|'))
      .map((a) => ({ key: a.key, value: a.value }))
    const res = await contractApi.updateWorkflow(schema, contractId, { attrs, audit })
    setWorkflow(toWorkflow(res.workflow).workflow)
    setToast(t.toast.workflowSaved(res.changeCount || count, audit.ticket))
  }

  const changeTab = (next: ContractTab) => {
    setTab(next)
    // 새로고침해도 같은 탭이 열리도록 주소만 갱신한다
    replaceUrl(`/contract/${encodeURIComponent(contract.id)}`, next === 'basic' ? {} : { tab: next })
  }

  return (
    <CompanyShell active="contract" trail={[{ label: t.breadcrumb.features }, { label: t.breadcrumb.contract, href: '/contract' }, { label: contract.id }]}>
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
              window.location.assign(`/contract?q=${encodeURIComponent(query.trim())}`)
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
                  <StatusDot status={contract.status} tone={contract.statusCode ? mockStatusOf({ code: contract.statusCode, groupCode: contract.statusGroup ?? null }) : undefined} className="text-ink" />
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
              docs={docs}
              template={template}
              onSave={saveBasic}
              onShowWorkflow={() => changeTab('workflow')}
            />
          )}
          {tab === 'members' && (
            <MembersTab
              members={members}
              onEdit={saveMember}
              onAdd={addMember}
            />
          )}
          {tab === 'workflow' && (
            <div className="flex flex-col gap-6">
              <WorkflowTab
                workflow={workflow}
                guide={workflowView.guide}
                users={workflowView.users}
                history={history}
                onSave={saveWorkflow}
              />
              <HistoryTab
                history={history}
                emails={emails}
                members={historyUsers}
                onSaveRow={saveHistory}
              />
            </div>
          )}
        </div>
      </div>
    </CompanyShell>
  )
}
