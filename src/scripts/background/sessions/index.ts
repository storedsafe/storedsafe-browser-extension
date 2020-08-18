import { logger as backgroundLogger } from '../../background'
import Logger from '../../../utils/Logger'

export const logger = new Logger('Sessions', backgroundLogger)

export { IdleHandler } from './IdleHandler'
export { KeepAliveHandler } from './KeepAliveHandler'
export { OnlineStatusHandler } from './OnlineStatusHandler'
export { TimeoutHandler } from './TimeoutHandler'