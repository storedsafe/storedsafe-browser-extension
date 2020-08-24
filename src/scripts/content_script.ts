import { MessageHandler } from './content_script/messages/MessageHandler'
import Logger from '../utils/Logger'
import { PageScanner, Forms } from './content_script/forms/PageScanner'

export const logger = new Logger('Content')
const formsLogger = new Logger('Forms', logger)

logger.log('Content script initialized: ', new Date(Date.now()))

function onPageScan (forms: Forms) {
  for (const [element, values] of forms) {
    logger.log('Form: %o, Type: %s', element, values.type)
  }
}

MessageHandler.StartTracking()

const pageScanner = new PageScanner()
onPageScan(pageScanner.forms)
pageScanner.subscribeToMutations(onPageScan)
