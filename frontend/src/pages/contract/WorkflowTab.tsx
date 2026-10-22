import { useState } from 'react'
import { ChevronRightIcon, EditIcon } from '../../components/icons'
import { Button } from '../../components/ui'
import { cn } from '../../lib/cn'
import { MOCK_GUIDE, MOCK_WORKFLOW_USERS } from '../../mocks/contract'
import type { HistoryRow, Workflow } from '../../mocks/contract'
import { texts } from '../../texts'
import { WorkflowEditModal } from './WorkflowEditModal'

const t = texts.contract.workflow

type Props = {
  workflow: Workflow
  history: HistoryRow[]
  onSave: (next: Workflow, changeCount: number, ticket: string) => void
}

type StageState = 'done' | 'current' | 'pending'

const stageTone: Record<StageState, { card: string; no: string; badge: string }> = {
  done: { card: 'border border-line-strong bg-bg text-ink shadow-card', no: 'bg-line text-ink-2', badge: 'border border-line bg-[#f2f2f5] text-ink-2' },
  current: { card: 'border-2 border-[#e5a800] bg-[#fff8db] text-ink shadow-[0_0_0_4px_rgba(254,198,1,0.18)]', no: 'bg-[#fec601] text-[#3a2e00]', badge: 'bg-[#fec601] text-[#3a2e00]' },
  pending: { card: 'border border-dashed border-line-strong bg-surface text-ink-3 shadow-card', no: 'bg-[#f2f2f5] text-ink-4', badge: 'bg-[#f2f2f5] text-ink-4' },
}

/** 계약 워크플로우 (계약 형태 · 프로세스 가이드) */
export function WorkflowTab({ workflow, history, onSave }: Props) {
  const [editing, setEditing] = useState(false)

  // 현재 단계 = 가장 최근 액션이 도착한 단계
  const latest = [...history].sort((a, b) => (a.at < b.at ? -1 : 1)).at(-1)
  const currentIndex = MOCK_GUIDE.findIndex((g) => g.name === latest?.to || g.substages?.includes(latest?.to ?? ''))

  return (
    <section aria-labelledby="workflow-title" className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3 px-3">
        <h2 id="workflow-title" className="m-0 text-[13px] font-semibold">
          {t.title}
        </h2>
        <Button icon={<EditIcon size={14} />} onClick={() => setEditing(true)} className="h-9 rounded-ctl px-[18px] font-semibold">
          {t.edit}
        </Button>
      </div>

      <div className="flex flex-col gap-[22px] rounded-card border border-line bg-surface px-[22px] py-5 shadow-card">
        <div className="flex flex-col gap-2.5">
          <h3 className="m-0 text-[13px] font-semibold">{t.shapeTitle}</h3>
          <dl className="m-0 grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-px overflow-hidden rounded-xl border border-line-soft bg-line-soft shadow-card">
            {[
              { label: texts.contract.workflowEdit.fields.name, value: <span className="text-[13px] font-medium">{workflow.name}</span> },
              { label: texts.contract.workflowEdit.fields.rev, value: <code className="rounded-[5px] bg-[#ebebf0] px-1.5 py-px font-mono text-[11.5px] text-ink-2">{workflow.rev}</code> },
            ].map((r) => (
              <div key={r.label} className="grid grid-cols-[148px_minmax(0,1fr)] bg-surface">
                <dt className="flex items-center bg-[#fafafb] px-3.5 py-2.5 text-[12.5px] font-medium text-ink-3">{r.label}</dt>
                <dd className="m-0 flex flex-wrap items-center gap-1 px-3 py-2">{r.value}</dd>
              </div>
            ))}
            {workflow.attrs.map((a) => (
              <div key={a.key} className="grid grid-cols-[148px_minmax(0,1fr)] bg-surface">
                <dt className="flex items-center bg-[#fafafb] px-3.5 py-2.5 text-[12.5px] font-medium text-ink-3">{a.label}</dt>
                <dd className="m-0 flex flex-wrap items-center gap-1 px-3 py-2">
                  {a.value.map((v) => (
                    <span key={v} className="inline-flex h-6 items-center rounded-md bg-[#f2f2f5] px-[9px] text-xs font-medium text-ink">
                      {v}
                    </span>
                  ))}
                  {a.value.length === 0 && <span className="text-xs text-ink-5">{texts.contract.empty}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="m-0 text-[13px] font-semibold">{t.usersTitle}</h3>
            <span className="text-xs text-ink-4">{t.usersHint}</span>
          </div>
          <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,250px),1fr))] gap-2.5 p-0">
            {MOCK_WORKFLOW_USERS.map((u) => {
              // 워크플로우 항목이 '불필요'면 해당 역할은 쓰이지 않는다
              const unused = !!u.opt && workflow.attrs.find((a) => a.key === u.opt)?.value.includes('불필요')
              return (
                <li key={u.role} className={cn('flex min-w-0 flex-col gap-1.5 rounded-xl border px-3.5 py-3', unused ? 'border-dashed border-line-strong bg-[#fafafb] text-ink-4' : 'border-line-strong bg-surface shadow-card')}>
                  <span className="flex items-center justify-between gap-2">
                    <span className={cn('inline-flex h-5 items-center rounded-md px-2 text-[10.5px] font-semibold leading-none', unused ? 'bg-[#f2f2f5] text-ink-4' : 'bg-[#d6336c] text-white')}>{u.role}</span>
                    {unused && <span className="rounded-full bg-[#f2f2f5] px-[7px] py-px text-[10.5px] font-semibold text-ink-4">{t.usersUnused}</span>}
                  </span>
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className={cn('text-[15px] font-bold', unused && 'font-semibold')}>{u.name}</span>
                    <span className="text-xs text-ink-4">{u.dept}</span>
                  </span>
                  <span className="truncate text-xs text-ink-3">{u.email}</span>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="flex flex-col gap-2.5">
          <h3 className="m-0 text-[13px] font-semibold">{t.processTitle}</h3>
          <ol className="m-0 flex list-none items-stretch gap-1.5 overflow-x-auto p-0">
            {MOCK_GUIDE.map((g, i) => {
              const state: StageState = currentIndex < 0 || i > currentIndex ? 'pending' : i === currentIndex ? 'current' : 'done'
              const tone = stageTone[state]
              return (
                <li key={g.name} className="flex min-w-[150px] flex-1 items-center gap-1.5" aria-current={state === 'current' ? 'step' : undefined}>
                  <div className={cn('flex flex-1 flex-col gap-2 self-stretch rounded-xl p-3', tone.card)}>
                    <span className="flex items-center justify-between gap-1.5">
                      <span className={cn('inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold', tone.no)}>{i + 1}</span>
                      <span className={cn('whitespace-nowrap rounded-full px-[7px] py-px text-[10.5px] font-semibold', tone.badge)}>{t.stateLabel[state]}</span>
                    </span>
                    <span className="text-[13px] font-semibold leading-snug">{g.name}</span>
                    <span className="flex flex-col gap-1 border-t border-line-soft pt-2">
                      {g.people.map((p) => (
                        <span key={p.name} className="flex min-w-0 flex-col gap-px leading-tight">
                          <span className="text-xs font-medium text-ink">{p.name}</span>
                          <span className="text-[11px] text-ink-4">{p.dept}</span>
                        </span>
                      ))}
                    </span>
                  </div>
                  {i < MOCK_GUIDE.length - 1 && <ChevronRightIcon size={14} aria-hidden="true" className="shrink-0 text-ink-5" />}
                </li>
              )
            })}
          </ol>
        </div>
      </div>

      {editing && (
        <WorkflowEditModal
          workflow={workflow}
          onClose={() => setEditing(false)}
          onSave={(next, count, ticket) => {
            onSave(next, count, ticket)
            setEditing(false)
          }}
        />
      )}
    </section>
  )
}
