// TODO: 백엔드 연동 시 제거
import type { ServicePlatform } from '../lib/platform'

export type Company = { schema: string; name: string; domain: string; users: number }

export const MOCK_COMPANIES: Record<ServicePlatform, Company[]> = {
  BUPTLE_BIZ: [
    { schema: 'acetech', name: '에이스테크놀로지(주)', domain: 'ace-tech.buptle.app', users: 128 },
    { schema: 'hanil_ind', name: '한일산업', domain: 'hanil.buptle.app', users: 64 },
    { schema: 'mirae_fin', name: '미래파이낸스', domain: 'mirae.buptle.app', users: 212 },
    { schema: 'daehan_eng', name: '대한엔지니어링', domain: 'daehan.buptle.app', users: 87 },
    { schema: 'seoul_med', name: '서울메디컬', domain: 'seoulmed.buptle.app', users: 45 },
  ],
  BUPTLE_NOVA: [
    { schema: 'nova_greenbio', name: '그린바이오', domain: 'greenbio.nova.buptle.app', users: 39 },
    { schema: 'nova_kwon_law', name: '권앤파트너스', domain: 'kwonlaw.nova.buptle.app', users: 18 },
    { schema: 'nova_blueship', name: '블루쉽로지스틱스', domain: 'blueship.nova.buptle.app', users: 73 },
  ],
}

/** 최근 작업 고객사 */
export const MOCK_RECENT: { schema: string; platform: ServicePlatform }[] = [
  { schema: 'acetech', platform: 'BUPTLE_BIZ' },
  { schema: 'mirae_fin', platform: 'BUPTLE_BIZ' },
  { schema: 'nova_greenbio', platform: 'BUPTLE_NOVA' },
]

/** 컨피그 불일치 배치 결과 */
export const MOCK_CONFIG_MISMATCH = { platform: 'BUPTLE_BIZ', count: 3, lastBatchAt: '08:30' } as const
