import { Logger, LogLevel } from '../global/logger'
import type { Message } from '../global/messages'
import { createIframe, onIframeMessage } from './tasks/createIframe'
import {
  scanner,
  Form,
  InputType,
  FORM_FILL_TYPES,
  FORM_SAVE_TYPES,
  INPUT_FILL_TYPES
} from './tasks/scanner'

const logger = new Logger('content')

logger.debug('CONTENT SCRIPT INITIALIZED')

let submitLock = false
function onSubmit (form: Form) {
  if (!submitLock) {
    submitLock = true

    let data: Record<string, string> = {}
    data['name'] = document.title.substr(0, 128)
    data['url'] = document.location.origin + document.location.pathname
    for (const [input, inputType] of form[2]) {
      if (INPUT_FILL_TYPES.includes(inputType)) {
        data[inputType] = (input as HTMLInputElement).value
      }
    }

    port.postMessage({
      context: 'save',
      action: 'init',
      data
    })

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

function onMessage (message: Message) {
  if (message.context === 'save') {
    if (message.action === 'open') {
      createIframe('save')
    }
  }
}

browser.runtime.onMessage.addListener(onIframeMessage)
const port = browser.runtime.connect({ name: 'content' })
port.onMessage.addListener(onMessage)
scanner(onFormsChange)
