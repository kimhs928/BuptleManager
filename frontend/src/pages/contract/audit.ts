import type { AuditInfo } from '../../components/ui/EditModal'
import { MOCK_ACCOUNT } from '../../mocks/auth'
import { MOCK_COMPANY_DETAIL } from '../../mocks/companyDetail'

/** 히스토리에 자동 기록되는 작업 정보 */
export function makeAudit(action: string, at: string): AuditInfo {
  return {
    actor: `${MOCK_ACCOUNT.name} (${MOCK_ACCOUNT.role})`,
    at,
    company: `${MOCK_COMPANY_DETAIL.name} · ${MOCK_COMPANY_DETAIL.schema}`,
    action,
  }
}
