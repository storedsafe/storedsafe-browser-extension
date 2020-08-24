import { MessageHandler } from './content_script/messages/MessageHandler'
import Logger from '../utils/Logger'
import { PageScanner, Forms, FormValues } from './content_script/forms/PageScanner'

export const logger = new Logger('Content')
const formsLogger = new Logger('Forms', logger)

logger.log('Content script initialized: ', new Date(Date.now()))

function onPageScan (forms: Forms) {
  function onSubmit(inputs: HTMLInputElement[]) {
    
  }
  for (const [element, values] of forms) {
    logger.log('Form: %o, Type: %s', element, values.type)
    if (element instanceof HTMLFormElement) {
      element.addEventListener('submit', () => {
        onSubmit(values.inputElements)
      })
    }
    for (const submitElement of values.submitElements) {
      submitElement.addEventListener('click', () => {
        onSubmit(values.inputElements)
      })
    }
  }
}

MessageHandler.StartTracking()

const pageScanner = new PageScanner()
onPageScan(pageScanner.forms)
pageScanner.subscribeToMutations(onPageScan)
