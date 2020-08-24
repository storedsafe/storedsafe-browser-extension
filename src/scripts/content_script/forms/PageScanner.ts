import { logger as formsLogger } from '.'
import StoredSafeError from '../../../utils/StoredSafeError'
import Logger from '../../../utils/Logger'
import { InputType, FormType } from './matchers'

const logger = new Logger('Page Scanner', formsLogger)

const ELEMENT_SELECTORS = [
  'input',
  'button' // type=submit query doesn't work on default type
].join(',')

const SUBMIT_MATCHER = /login|signin|submit/i

export type FormValues = {
  type: FormType
  inputElements: Map<HTMLInputElement, InputType>
  submitElements: HTMLElement[]
}
export type Forms = Map<HTMLFormElement | HTMLElement, FormValues>

class StoredSafePageScannerError extends StoredSafeError {}

/**
 * Scans page to find all forms or pseudo-forms (forms not encased in a form-element).
 * Also uses a MutationObserver to detect changes in the DOM so that forms that are
 * loaded late can be found.
 */
export class PageScanner {
  forms: Forms = new Map()
  private observer: MutationObserver = null

  constructor () {
    // Make sure JS remembers what `this` is
    this.filterSubmits = this.filterSubmits.bind(this)
    this.findForms = this.findForms.bind(this)
    this.findPseudoForms = this.findPseudoForms.bind(this)
    this.mapCommonElements = this.mapCommonElements.bind(this)
    this.mapParentForm = this.mapParentForm.bind(this)
    this.getInputs = this.getInputs.bind(this)
    this.hasForm = this.hasForm.bind(this)
    this.mapParentForm = this.mapParentForm.bind(this)
    this.onMutation = this.onMutation.bind(this)
    this.scan = this.scan.bind(this)
    this.shouldScan = this.shouldScan.bind(this)
    this.subscribeToMutations = this.subscribeToMutations.bind(this)
    this.unsubscribeFromMutations = this.unsubscribeFromMutations.bind(this)

    this.forms = this.scan()
  }

  /**
   * Get all relevant inputs and buttons (or button-like elements) contained in the element.
   */
  private getInputs (
    root: Document | Element
  ): [HTMLInputElement[], HTMLElement[]] {
    const inputs: HTMLInputElement[] = []
    const submits: HTMLElement[] = []
    for (const element of root.querySelectorAll(ELEMENT_SELECTORS)) {
      // Filter out unwanted elements
      if (element instanceof HTMLButtonElement && element.type !== 'submit')
        continue
      if (element instanceof HTMLInputElement) {
        // Input type elements
        inputs.push(element)
      } else if (element instanceof HTMLButtonElement) {
        // Submit type elements
        submits.push(element)
      }
    }
    return [inputs, submits]
  }

  private mapParentForm<T extends HTMLElement> (
    forms: NodeListOf<HTMLFormElement>,
    elements: T[]
  ): Map<HTMLFormElement, T[]> {
    const mappedElements = new Map<HTMLFormElement, T[]>()
    mappedElements.set(null, [])
    for (const element of elements) {
      let hasForm = false
      for (const form of forms) {
        let formElements: T[] = mappedElements.get(form)
        if (formElements === undefined) {
          formElements = []
          mappedElements.set(form, formElements)
        }
        if (form.contains(element)) {
          hasForm = true
          formElements.push(element)
        }
      }
      if (!hasForm) mappedElements.get(null).push(element)
    }
    return mappedElements
  }

  private filterSubmits (submits: HTMLElement[]): HTMLElement[] {
    const scores: Map<HTMLElement, number> = new Map()
    for (const submitElement of submits) {
      let score = 0
      if (
        submitElement.outerHTML.match(/(<[^>]*>)/)?.[0]?.match(SUBMIT_MATCHER)
      ) {
        score += 3
      }
      if (submitElement instanceof HTMLButtonElement) {
        score++
        if (submitElement.type === 'submit') {
          score++
        }
      }
      scores.set(submitElement, score)
    }
    // Collect the elements with the highest scores
    const bestMatches: [number, HTMLElement[]] = [...scores].reduce(
      ([maxScore, elements], [element, score]) =>
        score > maxScore
          ? [score, [element]] // Replace max score
          : score === maxScore
          ? [maxScore, [element, ...elements]]
          : [maxScore, elements],
      [0, []] as [number, HTMLElement[]]
    )
    return bestMatches[1]
  }

  /**
   * Find all forms on the page relative to the root element provided.
   * Returns a map of forms to associated inputs where the null key is
   * used to store all unassociated inputs.
   * @param root Element to start search from.
   * @param elements Elements to be associated with the forms.
   */
  private findForms (
    root: Document | Element,
    inputs: HTMLInputElement[],
    submits: HTMLElement[]
  ): Forms {
    const formElements = root.querySelectorAll('form')
    const formInputs = this.mapParentForm<HTMLInputElement>(
      formElements,
      inputs
    )
    const formSubmits = this.mapParentForm<HTMLElement>(formElements, submits)

    const forms: Forms = new Map()
    // Merge inputs and submits into forms
    for (const [form, inputs] of formInputs) {
      // Should be same forms as inputs, either way a form without inputs isn't interesting
      const submitElements = formSubmits.has(form)
        ? this.filterSubmits(formSubmits.get(form))
        : []
      const inputElements: Map<HTMLInputElement, InputType> = new Map(
        inputs.map(element => [element, InputType.Unknown])
      )
      // TODO TOMORROW: Get form type from matcher
      forms.set(form, {
        type: FormType.Unknown,
        inputElements,
        submitElements
      })
    }
    return forms
  }

  private mapCommonElements<T extends HTMLElement> (
    elements: T[],
    otherElements: HTMLElement[],
    root: HTMLElement
  ): Map<HTMLElement, T[]> {
    const groups: Map<HTMLElement, T[]> = new Map()
    for (const element of elements) {
      let parent = element.parentElement
      let others = [...otherElements]

      // Loop until all elements are matched through a common element.
      while (others.length > 0 && parent !== root.parentElement) {
        // Check if the current parent is a common node
        let foundMatch = false
        const unmatched = others.filter((other, index) => {
          const isMatch = element !== other && parent.contains(other)
          if (isMatch) foundMatch = true
          return element !== other && !isMatch
        })
        others = unmatched

        // Update the group list if the current parent is a common node
        // NOTE: It's possible a more efficient solution could be found where both ends
        // of the match are added. In the current state however, it is unknown which
        // elements are in both lists (since the split of inputs and submits)
        if (foundMatch) {
          let group = groups.get(parent)
          if (group === undefined) {
            groups.set(parent, [element])
          } else {
            group.push(element)
          }
        }
        parent = parent.parentElement
      }

      // A situation where unmatched elements exist should not occur and indicates a programming error
      if (others.length > 0) {
        throw new StoredSafePageScannerError(
          'Reached top node without finding all common input elements.'
        )
      }
    }
    return groups
  }

  private findPseudoForms (
    root: HTMLElement,
    inputs: HTMLInputElement[],
    submits: HTMLElement[]
  ): Forms {
    const inputGroups = this.mapCommonElements<HTMLInputElement>(
      inputs,
      [...inputs, ...submits],
      root
    )
    const submitGroups = this.mapCommonElements<HTMLElement>(
      submits,
      [...inputs, ...submits],
      root
    )

    const forms: Forms = new Map()
    for (const [pseudoForm, inputs] of inputGroups) {
      const submitElements = submitGroups.has(pseudoForm)
        ? this.filterSubmits(submitGroups.get(pseudoForm))
        : []
      const inputElements: Map<HTMLInputElement, InputType> = new Map(inputs.map(element => ([
        element, InputType.Unknown
      ])))
      forms.set(pseudoForm, {
        type: FormType.Unknown,
        inputElements,
        submitElements
      })
    }

    // Sort by least amount of elements
    return new Map(
      [...forms].sort(
        ([k1, v1], [k2, v2]): number =>
          v1.inputElements.size +
          v1.submitElements.length -
          (v2.inputElements.size + v2.submitElements.length)
      )
    )
  }

  /**
   * Perform a second pass with extended selectors for submit buttons,
   * including anchor tags and div tags for forms that have a password
   * field.
   * @param forms Forms that were previously filtered out.
   */
  private secondPass (forms: Forms): Forms {
    for (const [form, formValues] of forms) {
      if (formValues.type !== FormType.Unknown) continue
      const selector = `*:not(${ELEMENT_SELECTORS.split(',').join('):not(')})`
      for (const element of form.querySelectorAll<HTMLElement>(selector)) {
        if (matchName(element, SUBMIT_MATCHER)) {
          formValues.submitElements.push(element)
        }
      }
    }
    return forms
  }

  private scan (root: HTMLElement = document.body): Forms {
    const [inputs, submits] = this.getInputs(root)
    // Get forms contained in form elements
    let forms = this.findForms(root, inputs, submits)

    // Assemble pseudo-forms from remaining inputs
    const unmatchedForm = forms.get(null)
    forms.delete(null)
    let pseudoForms = this.findPseudoForms(
      root,
      [...unmatchedForm.inputElements.keys()],
      unmatchedForm.submitElements
    )

    // Parse forms to figure out their type
    const parsedForms = parseForms(new Map([...forms, ...pseudoForms]))
    // Perform a second pass on unknown forms with extended selectors
    const secondPass = parseForms(this.secondPass(parsedForms))

    // Filter out duplicates and unknown forms
    const matchedForms: Forms = new Map()
    for (const [form, formValues] of secondPass) {
      if (formValues.type !== FormType.Unknown) {
        // Whether the form is a pseudo-form containing another identified form.
        let isPseudoParent = false
        for (const [matchedForm] of matchedForms) {
          if (form.contains(matchedForm)) isPseudoParent = true
        }
        if (!isPseudoParent) matchedForms.set(form, formValues)
      }
    }

    return matchedForms
  }

  /**
   * Whether or not a node is or contains one or more forms/pseudo-forms.
   * @param node Node potentially containing form/pseudo-form.
   */
  private hasForm (node: Node): boolean {
    return (
      node instanceof HTMLFormElement ||
      (node instanceof HTMLElement && node.querySelector('form') !== null)
    )
  }

  private hasInput (node: Node): boolean {
    return (
      node instanceof HTMLInputElement ||
      (node instanceof HTMLElement && node.querySelector('input') !== null)
    )
  }

  /**
   * Decide whether or not the update nodes should trigger a re-scan of the page.
   * @param nodes Nodes which were updated in DOM.
   */
  private shouldScan (node: Node): boolean {
    return this.hasForm(node)
  }

  private shouldScanFull (node: Node): boolean {
    return this.hasInput(node)
  }

  private onMutation (mutationsList: MutationRecord[]): Forms {
    let shouldScanFull = false
    const scanQueue: Node[] = []
    for (const mutation of mutationsList) {
      for (const node of mutation.addedNodes) {
        if (this.shouldScan(node)) {
          scanQueue.push(node as HTMLElement)
        } else if (this.shouldScanFull(node)) {
          shouldScanFull = true
        }
      }
      // TODO: Handle removed nodes
    }

    // If parts of forms have been loaded dynamically, re-scan the entire
    // page since we don't know which added nodes belong to which form.
    // It's possible a cheaper solution could be found but for now a full
    // re-scan is cheap enough. See skype.com login for example of lots of
    // partial mutations.
    if (shouldScanFull) {
      this.forms = this.scan()
      return this.forms
    }

    // If no partial forms are found, scan only new forms.
    let forms: Forms = new Map()
    for (const node of scanQueue) {
      forms = new Map([...forms, ...this.scan(node as HTMLElement)])
    }
    this.forms = new Map([...this.forms, ...forms])
    return forms
  }

  subscribeToMutations (listener?: (forms: Forms) => void): void {
    if (this.observer === null) {
      this.observer = new MutationObserver(mutations => {
        listener?.(this.onMutation(mutations))
      })
    }
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  unsubscribeFromMutations (): void {
    this.observer.disconnect()
  }
}
