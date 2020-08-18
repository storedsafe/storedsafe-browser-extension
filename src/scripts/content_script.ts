import { MessageHandler } from './content_script/messages/MessageHandler'
import Logger from '../utils/Logger'

const logger = new Logger('Content')
logger.log('Content script initialized: ', new Date(Date.now()))

MessageHandler.StartTracking()