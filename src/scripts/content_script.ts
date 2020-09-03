import Logger from '../utils/Logger'
export const logger = new Logger('Content')

import { MessageHandler } from './content_script/messages/MessageHandler'
import { PageScanner, Forms } from './content_script/forms/PageScanner'
import { SAVE_TYPES, FILL_TYPES } from './content_script/forms/matchers'
import { InputType } from './content_script/forms/constants'

logger.log('Content script initialized: ', new Date(Date.now()))

const pageScanner = new PageScanner()
const messageHandler = new MessageHandler(pageScanner)

// TODO: Create SubmitHandler for code below
/**
 * Set up submit events when the forms update.
 * TODO: Cleanup events
 * @param forms Newly updated forms.
 */
function onPageScan (forms: Forms) {
  let hasFillType = false
  for (const [element, values] of forms) {
    if (FILL_TYPES.includes(values.type)) hasFillType = true

    const inputs = values.inputElements
    let submitted = false // lock for onSubmit

    /**
     * Send submit message to background script to see if a save flow should
     * be started.
     * Locks the onSubmit for 100ms to prevent multiple submit events being
     * pushed as a consequence of having to track click events on buttons in
     * addition to submit events because some sites do not use actual forms
     * and submit events.
     *
     * NOTE: This could be done in a way such that all submit handlers are
     * disconnected on submit, but this would block new events from triggering
     * in the case where a user entered the wrong password and then tries again.
     */
    function onSubmit () {
      // Check lock status
      if (submitted) return
      submitted = true

      // Check if form is of a type that should be saved
      if (!SAVE_TYPES.includes(values.type)) return

      const submitLogger = new Logger(`Submit - ${values.type}`, logger)

      // TODO: Check cases where overlapping inputs exist (ex register confirm pass)
      let data: [InputType, string][] = []
      for (const [input, inputType] of inputs) {
        data.push([inputType, input.value])
      }
      submitLogger.debug(
        'Submitted data from fields %o in %o:',
        data.map(([field]) => field),
        element
      )
      messageHandler.sendSubmit(data)
      window.setTimeout(() => (submitted = false), 100)
    }

    element.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        onSubmit()
      }
    })

    const formsLogger = new Logger(`Form - ${values.type}`, logger)

    formsLogger.debug(
      'Form: %o, Type: %s, Inputs: %o, Buttons: %o',
      element,
      values.type,
      values.inputElements,
      values.submitElements
    )

    if (element instanceof HTMLFormElement) {
      element.addEventListener('submit', () => {
        onSubmit()
      })
    }
    for (const submitElement of values.submitElements) {
      submitElement.addEventListener('click', () => {
        onSubmit()
      })
    }
  }

  if (hasFillType) {
    messageHandler.sendOfferAutoFill()
  }
}

onPageScan(pageScanner.forms)
pageScanner.subscribeToMutations(onPageScan)
