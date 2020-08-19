import { MessageHandler } from './content_script/messages/MessageHandler'
import Logger from '../utils/Logger'
import { match } from 'assert'
import StoredSafeError from '../utils/StoredSafeError'

const logger = new Logger('Content')
logger.log('Content script initialized: ', new Date(Date.now()))

MessageHandler.StartTracking()

const inputLogger = new Logger('input', logger)
const formLogger = new Logger('forms', logger)

const INPUT_SELECTORS = [
  'input[type="text"]',
  'input[type="email"]',
  'input[type="password"]',
  'input[type="tel"]',
  'input[type="submit"]',
  'input[type="image"]', // Graphical submit button
  'button[type="submit"]'
].join(',')
// TODO: Handle a-tags used as buttons
// TODO: Handle some submit-buttons not coming up in query
type InputType = HTMLInputElement | HTMLButtonElement

function scan () {
  const forms = new Map<HTMLElement, InputType[]>()
  const soloInputs = []

  // TODO: Handle buttons
  for (const input of document.querySelectorAll(INPUT_SELECTORS)) {
    if (
      input instanceof HTMLInputElement ||
      input instanceof HTMLButtonElement
    ) {
      let hasForm = false
      for (const form of document.forms) {
        if (form instanceof HTMLFormElement) {
          let formInputs: InputType[] = forms.get(form)
          if (formInputs === undefined) {
            formInputs = []
            forms.set(form, formInputs)
          }
          if (form.contains(input)) {
            hasForm = true
            formInputs.push(input)
          }
        }
      }
      if (!hasForm) {
        soloInputs.push(input)
      }
    }
  }

  type InputNode = [number, InputType]
  type InputGroups = Map<Node & ParentNode, InputNode[]>
  const inputGroups: InputGroups = new Map()

  for (const input of soloInputs) {
    let otherInputs = [...soloInputs]
    let parent = input.parentNode
    let depth = 1
    while (otherInputs.length > 0) {
      if (parent === document) {
        throw new StoredSafeError(
          'Reached top node without finding all common input elements.'
        )
      }
      let foundMatch = false
      const unmatched = otherInputs.filter((other, index) => {
        const isMatch = input !== other && parent.contains(other)
        if (isMatch) foundMatch = true
        return input !== other && !isMatch
      })
      otherInputs = unmatched

      if (foundMatch) {
        let group = inputGroups.get(parent)
        const node: InputNode = [depth, input]
        if (group === undefined) {
          inputGroups.set(parent, [node])
        } else {
          group.push(node)
        }
      }
      parent = parent.parentNode
      depth++
    }
  }

  const pseudoForms = new Map(
    [...inputGroups].sort(([k1, v1], [k2, v2]) => v1.length - v2.length)
  )

  formLogger.log('FORMS %o', forms)
  formLogger.log('PSEUDO FORMS %o', pseudoForms)
}

scan()

const observer = new MutationObserver(mutationsList => {
  let update = false
  for (const mutation of mutationsList) {
    for (const node of mutation.addedNodes) {
      // if (node.id !== SAVE_FRAME_ID && (node instanceof HTMLFormElement || (node instanceof HTMLElement && node.querySelector('form') !== null))) {
      update = true
      // }
    }
  }
  if (update) {
    logger.log('DOM updated, scanning for forms.')
    scan()
  }
})
observer.observe(document.body, {
  childList: true,
  subtree: true
})
