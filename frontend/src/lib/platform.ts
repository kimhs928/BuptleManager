import { texts } from '../texts'

/** company 모듈 ServicePlatform과 동일 */
export type ServicePlatform = 'BUPTLE_BIZ' | 'BUPTLE_NOVA'

export const platformLabel: Record<ServicePlatform, string> = texts.common.platform
