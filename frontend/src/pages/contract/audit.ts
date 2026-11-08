import type { AuditInfo } from '../../components/ui/EditModal'
import { MOCK_ACCOUNT } from '../../mocks/auth'
import { currentCompany } from '../../lib/selectedCompany'

/** 히스토리에 자동 기록되는 작업 정보 */
export function makeAudit(action: string, at: string): AuditInfo {
  const company = currentCompany()
  return {
    actor: `${MOCK_ACCOUNT.name} (${MOCK_ACCOUNT.role})`,
    at,
    company: `${company.name} · ${company.schema}`,
    action,
  }
}
