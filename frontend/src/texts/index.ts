import { common } from './common'
import { company } from './company'
import { login } from './login'
import { main } from './main'

/** 화면 문구 단일 출처 */
export const texts = { common, company, login, main } as const
