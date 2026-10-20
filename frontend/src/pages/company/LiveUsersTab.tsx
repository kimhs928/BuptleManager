import { useState } from 'react'
import { LogOutIcon, RefreshIcon } from '../../components/icons'
import { Alert, Button, Card, EditModal } from '../../components/ui'
import type { Change } from '../../components/ui'
import { cn } from '../../lib/cn'
import { formatDateTime, formatTime } from '../../lib/date'
import { platformLabel } from '../../lib/platform'
import { MOCK_ACCOUNT } from '../../mocks/auth'
import type { CompanyDetail, LiveUser } from '../../mocks/companyDetail'
import { texts } from '../../texts'

const t = texts.company.liveUsers

type Props = {
  company: CompanyDetail
  users: LiveUser[]
  onForceLogout: (ids: string[], ticket: string) => void
}

const th = 'whitespace-nowrap px-4 py-2.5 text-left text-[11px] font-semibold tracking-wide text-ink-4'
const td = 'px-4 py-2.5 align-middle text-[13px]'

function UserCell({ user }: { user: LiveUser }) {
  return (
    <span className="flex flex-col">
      <span className="font-medium">{user.name}</span>
      <span className="text-xs text-ink-4">{user.email}</span>
    </span>
  )
}

/** 실시간 접속 유저 탭 (선택한 세션 강제 로그아웃) */
export function LiveUsersTab({ company, users, onForceLogout }: Props) {
  const platform = platformLabel[company.platform]
  const [selected, setSelected] = useState<string[]>([])
  const [refreshedAt, setRefreshedAt] = useState<string>(t.justNow)
  const [modalAt, setModalAt] = useState<string | null>(null)
  const [ticket, setTicket] = useState('')
  const [reason, setReason] = useState('')

  // 로그아웃으로 사라진 유저는 선택에서도 뺀다
  const selectedUsers = users.filter((u) => selected.includes(u.id))
  const allChecked = users.length > 0 && selectedUsers.length === users.length

  const toggle = (id: string) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  const toggleAll = () => setSelected(allChecked ? [] : users.map((u) => u.id))

  const openModal = () => {
    setModalAt(formatDateTime())
  }
  const closeModal = () => setModalAt(null)

  const confirm = () => {
    onForceLogout(
      selectedUsers.map((u) => u.id),
      ticket.trim(),
    )
    setSelected([])
    setTicket('')
    setReason('')
    closeModal()
  }

  const changes: Change[] = selectedUsers.map((u) => ({ field: `${u.name} (${u.email})`, before: t.modal.before, after: t.modal.after }))

  return (
    <section aria-labelledby="live-title" className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-end justify-between gap-3 px-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 id="live-title" className="m-0 inline-flex items-center gap-2 text-[13px] font-semibold">
            <span aria-hidden="true" className="relative inline-flex size-2">
              <span className="absolute inset-0 rounded-full bg-success" />
              <span className="absolute -inset-0.5 animate-pulse-ring rounded-full border-[1.5px] border-success/60" />
            </span>
            {t.title}
          </h2>
          <span className="text-xs text-ink-4">
            {t.footer(users.length, selectedUsers.length)} · {t.description(platform, refreshedAt)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<RefreshIcon size={14} />} onClick={() => setRefreshedAt(formatTime())}>
            {t.refresh}
          </Button>
          <Button variant="danger" size="sm" icon={<LogOutIcon size={14} />} disabled={selectedUsers.length === 0} onClick={openModal}>
            {selectedUsers.length > 0 ? t.forceLogoutWithCount(selectedUsers.length) : t.forceLogout}
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse">
            <thead>
              <tr className="border-b border-line-soft">
                <th scope="col" className="w-11 px-4 py-2.5">
                  <input type="checkbox" aria-label={t.selectAll} checked={allChecked} onChange={toggleAll} className="m-0 size-[15px] accent-primary" />
                </th>
                <th scope="col" className={th}>{t.columns.user}</th>
                <th scope="col" className={th}>{t.columns.employeeNo}</th>
                <th scope="col" className={th}>{t.columns.ip}</th>
                <th scope="col" className={th}>{t.columns.session}</th>
                <th scope="col" className={th}>{t.columns.lastActive}</th>
                <th scope="col" className={th}>{t.columns.loginAt}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {users.map((u) => {
                const checked = selected.includes(u.id)
                return (
                  <tr key={u.id} className={checked ? 'bg-[#f2f2f5]' : 'hover:bg-hover'}>
                    <td className="px-4 py-2.5">
                      <input type="checkbox" aria-label={t.selectUser(u.name)} checked={checked} onChange={() => toggle(u.id)} className="m-0 size-[15px] accent-primary" />
                    </td>
                    <td className={td}>
                      <UserCell user={u} />
                    </td>
                    <td className={cn(td, 'tabular-nums')}>{u.employeeNo}</td>
                    <td className={cn(td, 'font-mono text-xs')}>{u.ip}</td>
                    <td className={cn(td, 'font-mono text-xs')}>{u.session}</td>
                    <td className={td}>
                      <span className={cn('inline-flex items-center gap-1.5', u.recent ? 'font-medium text-success-ink' : 'text-ink-3')}>
                        <span aria-hidden="true" className={cn('size-[7px] rounded-full', u.recent ? 'bg-success' : 'bg-ink-5')} />
                        {u.lastActive}
                      </span>
                    </td>
                    <td className={cn(td, 'tabular-nums text-ink-3')}>{u.loginAt}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {users.length === 0 && <div className="px-6 py-14 text-center text-[13px] text-ink-4">{t.empty}</div>}
        </div>
      </Card>

      {modalAt && (
        <EditModal
          title={t.modal.title}
          description={t.modal.description(platform)}
          saveLabel={t.modal.confirm(selectedUsers.length)}
          changes={changes}
          audit={{ actor: `${MOCK_ACCOUNT.name} (${MOCK_ACCOUNT.role})`, at: modalAt, company: `${company.name} · ${company.schema}`, action: t.modal.action }}
          ticket={ticket}
          onTicketChange={setTicket}
          reason={reason}
          onReasonChange={setReason}
          onClose={closeModal}
          onSave={confirm}
        >
          <Card className="overflow-hidden">
            <div className="border-b border-line-soft px-4 py-2.5 text-xs font-semibold text-ink-2">{t.modal.targets(selectedUsers.length)}</div>
            <div className="grid grid-cols-[1.6fr_0.8fr_1fr_1.2fr] gap-3 border-b border-line-soft px-4 py-2 text-[11px] font-semibold text-ink-4">
              <span>{t.columns.user}</span>
              <span>{t.columns.employeeNo}</span>
              <span>{t.columns.ip}</span>
              <span>{t.columns.session}</span>
            </div>
            <ul className="m-0 list-none divide-y divide-line-soft p-0">
              {selectedUsers.map((u) => (
                <li key={u.id} className="grid grid-cols-[1.6fr_0.8fr_1fr_1.2fr] items-center gap-3 px-4 py-2.5 text-[13px]">
                  <UserCell user={u} />
                  <span className="tabular-nums">{u.employeeNo}</span>
                  <span className="font-mono text-xs">{u.ip}</span>
                  <span className="font-mono text-xs">{u.session}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Alert tone="danger">{t.modal.warning}</Alert>
        </EditModal>
      )}
    </section>
  )
}
