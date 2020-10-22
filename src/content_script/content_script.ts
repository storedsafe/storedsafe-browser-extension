import { Logger, LogLevel } from '../global/logger'
import {
  scanner,
  Form,
  InputType,
  FORM_FILL_TYPES,
  FORM_SAVE_TYPES
} from './tasks/scanner'

const logger = new Logger('content')

logger.debug('CONTENT SCRIPT INITIALIZED')

function printForms (forms: Form[]) {
  for (const [form, formType, inputs] of forms) {
    logger.group(formType, LogLevel.DEBUG)
    logger.debug('%o', form)
    for (const [input, inputType] of inputs) {
      if (inputType === InputType.HIDDEN) {
      }
      logger.debug('%s %o', inputType, input)
    }
    logger.groupEnd(LogLevel.DEBUG)
  }
}

let submitLock = false
function onSubmit (form: Form) {
  if (!submitLock) {
    submitLock = true

    // TODO: save form data

    setTimeout(() => (submitLock = false), 100)
  }
}

let submitListeners: Map<HTMLElement, [string, () => void]> = new Map()

function onFormsChange (forms: Form[]) {
  for (const [listener, [event, cb]] of submitListeners) {
    listener.removeEventListener(event, cb)
  }
  for (const form of forms) {
    if (FORM_FILL_TYPES.includes(form[1])) {
      // TODO: autofill
    }

    if (FORM_SAVE_TYPES.includes(form[1])) {
      const cb = () => onSubmit(form)
      if (form[0] instanceof HTMLFormElement) {
        submitListeners.set(form[0], ['submit', cb])
        form[0].addEventListener('submit', cb)
      }
      for (const [input, inputType] of form[2]) {
        if (inputType === InputType.SUBMIT) {
          submitListeners.set(input, ['click', cb])
          input.addEventListener('click', cb)
        }
      }
    }
  }
}

scanner(onFormsChange)
