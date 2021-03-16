import { Logger, LogLevel } from '../../../global/logger'
import {
  FormType,
  FORM_FILL_TYPES,
  FORM_SAVE_TYPES,
  InputType
} from './constants'
import { Form, getForms } from './forms'
import { getInputs, INPUT_SELECTORS } from './inputs'

const logger = new Logger('scanner', true)

function printForms (forms: Form[]) {
  for (const [form, formType, inputs] of forms) {
    if (formType === FormType.UNKNOWN) {
      logger.debug('Unknown form %o', form)
      return
    }
    if (formType === FormType.HIDDEN) {
      logger.debug('Hidden form %o', form)
      return
    }
    logger.group(formType + " form", LogLevel.DEBUG)
    logger.debug('%o', form)
    for (const [input, inputType] of inputs) {
      if (inputType === InputType.HIDDEN) {
      }
      logger.debug('%s %o', inputType, input)
    }
    logger.groupEnd(LogLevel.DEBUG)
  }
}

function filterForms (forms: Form[]): Form[] {
  return forms.filter(([_form, formType]) => {
    return (
      FORM_FILL_TYPES.includes(formType) || FORM_SAVE_TYPES.includes(formType)
    )
  })
}

export function scanner (cb: (forms: Form[]) => void) {
  let forms: Form[] = []

  function updateForms (newForms: Form[]) {
    printForms(newForms)
    forms = filterForms(newForms)
    cb(forms)
  }
  updateForms(getForms(getInputs()))

  const observer = new MutationObserver(mutations => {
    const newForms: Map<HTMLElement, Form> = new Map()
    const scanQueue: Set<HTMLElement> = new Set()
    for (const mutation of mutations) {
      // Added nodes
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement) {
          // Skip if node has no relevant elements
          if (
            !(
              INPUT_SELECTORS.includes(node.nodeName.toLowerCase()) ||
              node.querySelector(INPUT_SELECTORS)
            )
          )
            continue
          let isChildNode = false
          for (const form of forms) {
            if (form[0].contains(node)) {
              // If form contains node, rescan form
              scanQueue.add(form[0])
              isChildNode = true
            } else if (!node.contains(form[0])) {
              // If the form is unrelated to the change, leave it as is
              newForms.set(form[0], form)
            }
          }
          // Add the node to the scan queue if it's not part of another form or element
          for (const element of scanQueue) {
            if (node.contains(element)) {
              // Delete any elements that contain this node
              scanQueue.delete(element)
            } else if (element.contains(node)) {
              isChildNode = true
            }
          }
          if (!isChildNode) scanQueue.add(node)
        }
      }

      // Removed nodes
      for (const node of mutation.removedNodes) {
        if (node instanceof HTMLElement) {
          for (const form of forms) {
            if (form[0].contains(node)) {
              // If the form contains the node, rescan then form
              scanQueue.add(form[0])
            } else if (!node.contains(form[0])) {
              // If the form is not inside the removed node, leave it as is
              newForms.set(form[0], form)
            }
          }
        }
      }
    }

    if (scanQueue.size > 0) {
      logger.debug('Mutations observed, rescanning %d nodes', scanQueue.size)
      for (const element of scanQueue) {
        const elementForms = getForms(getInputs(element))
        for (const form of elementForms) {
          newForms.set(form[0], form)
        }
      }
      updateForms([...newForms.values()])
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

  return {
    stop () {
      observer.disconnect()
    }
  }
}
