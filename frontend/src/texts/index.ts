import { admin } from './admin'
import { common } from './common'
import { company } from './company'
import { configManage } from './configManage'
import { contract } from './contract'
import { counsel } from './counsel'
import { history } from './history'
import { lawsuit } from './lawsuit'
import { report } from './report'
import { login } from './login'
import { main } from './main'
import { user } from './user'

/** 화면 문구 단일 출처 */
export const texts = { admin, common, company, configManage, contract, counsel, history, lawsuit, login, main, report, user } as const
