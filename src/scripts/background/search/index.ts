import { logger as backgroundLogger } from '../../background'
import Logger from '../../../utils/Logger'

export const logger = new Logger('Search', backgroundLogger)

export { TabHandler } from './TabHandler'