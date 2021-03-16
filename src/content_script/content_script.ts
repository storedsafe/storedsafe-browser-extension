import { Logger } from '../global/logger'
import type { Message } from '../global/messages'
import { settings } from '../global/storage'
import { createIframe, onIframeMessage } from './tasks/createIframe'
import {
  scanner,
  Form,
  InputType,
  FORM_FILL_TYPES,
  FORM_SAVE_TYPES,
  INPUT_FILL_TYPES
} from './tasks/scanner'

Logger.Init().then(() => {
  const logger = new Logger('content')

  logger.info('Content script initialized')

  let submitLock = false
  function onSubmit(form: Form) {
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

      logger.debug('Submitted form: %o %o', form, data)

      port.postMessage({
        context: 'save',
        action: 'init',
        data
      })

      window.setTimeout(() => (submitLock = false), 100)
    }
  }

  let currentForms: Form[] = []
  let submitListeners: Map<HTMLElement, [string, () => void]> = new Map()

  function onFormsChange(forms: Form[]) {
    currentForms = forms
    for (const [listener, [event, cb]] of submitListeners) {
      listener.removeEventListener(event, cb)
    }
    for (const form of forms) {
      if (FORM_FILL_TYPES.includes(form[1])) {
        settings.get().then(settings => {
          if (settings.get('autoFill')) {

          }
        })
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

  function fill(data: Record<string, string>) {
    for (const form of currentForms) {
      if (FORM_FILL_TYPES.includes(form[1])) {
        for (const input of form[2]) {
          if (INPUT_FILL_TYPES.includes(input[1]) && input[0] instanceof HTMLInputElement) {
            input[0].value = data[input[1]]
            input[0].dispatchEvent(new InputEvent('input', { bubbles: true }))
          }
        }
      }
    }
  }

  function onMessage(message: Message) {
    logger.debug('Message Received: %o', message)
    if (message.context === 'save' && message.action === 'open') {
      createIframe('save')
    }
    if (message.context === 'fill' && message.action === 'open') {
      createIframe('fill')
    }
    else if (message.context === 'fill' && message.action === 'fill') {
      fill(message.data)
    }
    else if (message.context === 'iframe') {
      onIframeMessage(message)
    }
  }

  browser.runtime.onMessage.addListener(onMessage)
  const port = browser.runtime.connect({ name: 'content' })
  port.onMessage.addListener(onMessage)
  scanner(onFormsChange)
})