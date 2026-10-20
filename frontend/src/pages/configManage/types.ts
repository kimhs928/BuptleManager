import type { ConfigRow, ConfigScope } from '../../mocks/companyDetail'

/** PUBLIC까지 포함한 컨피그 타입 */
export type ManagedScope = ConfigScope | 'PUBLIC'

/** 관리 화면의 컨피그 한 건. PUBLIC은 고객사에 속하지 않아 customerId가 빈 문자열이다 */
export type ManagedRow = Omit<ConfigRow, 'scope'> & { scope: ManagedScope; customerId: string }
