import { MessageHandler } from './content_script/messages/MessageHandler'
import Logger from '../utils/Logger'
import { PageScanner } from './content_script/forms/PageScanner'

export const logger = new Logger('Content')

logger.log('Content script initialized: ', new Date(Date.now()))

MessageHandler.StartTracking()
const pageScanner = new PageScanner()
pageScanner.subscribeToMutations(forms => {
  logger.log('MUTATION')
  for (const [element, values] of forms) {
    logger.log('Element: %o, Values: %o', element, values)
  }
})

for (const [element, values] of pageScanner.forms) {
  logger.log('Element: %o, Values: %o', element, values)
}

const inputLogger = new Logger('input', logger)
const formLogger = new Logger('forms', logger)
