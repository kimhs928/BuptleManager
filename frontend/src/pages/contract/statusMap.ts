import type { EnumValue } from '../../lib/enums'
import type { ContractStatus } from '../../mocks/contract'

/**
 * 화면 목업은 상태를 5개 문구로만 들고 있다. 실제 상태 코드(BizContractStatus)로 바꾸기 전까지
 * 목업 문구와 대표 코드를 서로 바꿔 쓴다.
 */
const MOCK_STATUS_CODE: Record<ContractStatus, string> = { 작성중: '10', 검토중: '50', '서명 진행중': '100', '체결 완료': '120', 반려: '90' }

/** 목업 상태 문구에 해당하는 대표 상태 코드 */
export function statusCodeOf(status: ContractStatus): string {
  return MOCK_STATUS_CODE[status]
}

/** 상태 코드를 목업 상태 문구로 줄인다 (목록의 색 표시용) */
export function mockStatusOf(value: Pick<EnumValue, 'code' | 'groupCode'>): ContractStatus {
  if (value.code === '120') return '체결 완료'
  switch (value.groupCode) {
    case 'CONT_GRP_STS_DRAFT':
      return '작성중'
    case 'CONT_GRP_STS_SIGN':
    case 'CONT_GRP_STS_DOC_CONTRACT_POST_PROC':
      return '서명 진행중'
    case 'CONT_GRP_STS_DONE':
    case 'CONT_GRP_STS_STOP':
      return '반려'
    default:
      return '검토중'
  }
}
