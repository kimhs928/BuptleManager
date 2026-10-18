/** 백엔드 company 모듈의 ServicePlatform enum 과 동일한 값 */
export type ServicePlatform = 'BUPTLE_BIZ' | 'BUPTLE_NOVA'

export const platformLabel: Record<ServicePlatform, string> = {
  BUPTLE_BIZ: 'Buptle Biz',
  BUPTLE_NOVA: 'Buptle Nova',
}
