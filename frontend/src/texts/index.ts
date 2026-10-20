import { common } from './common'
import { company } from './company'
import { contract } from './contract'
import { login } from './login'
import { main } from './main'
import { user } from './user'

/** 화면 문구 단일 출처 */
export const texts = { common, company, contract, login, main, user } as const
