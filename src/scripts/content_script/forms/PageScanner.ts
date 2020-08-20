import { logger as formsLogger } from '.'
import StoredSafeError from '../../../utils/StoredSafeError'
import Logger from '../../../utils/Logger'
import { FormFilter, formFilters } from './formFilters'

const logger = new Logger('Page Scanner', formsLogger)

const ELEMENT_SELECTORS = [
  'input',
  'button', // type=submit query doesn't work on default type
  'a' // Buttons as link elements
].join(',')
const SUBMIT_MATCHER = /login|signin|submit/i

/**
 * Describes the purpose of the form. Some forms should be filled while others
 * should be ignored or handled as special cases.
 * */
enum FormType {
  Login = 'login',
  Card = 'card',
  Search = 'search',
  ContactInfo = 'contactinfo',
  NewsLetter = 'newsletter',
  Register = 'register',
  Unknown = 'unknown'
}

type InputType = HTMLInputElement
type SubmitType = HTMLButtonElement | HTMLAnchorElement
export type FormValues = {
  type: FormType
  inputElements: InputType[]
  submitElements: SubmitType[]
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
    this.getFormType = this.getFormType.bind(this)
    this.getInputs = this.getInputs.bind(this)
    this.hasForm = this.hasForm.bind(this)
    this.mapParentForm = this.mapParentForm.bind(this)
    this.onMutation = this.onMutation.bind(this)
    this.scan = this.scan.bind(this)
    this.shouldUpdate = this.shouldUpdate.bind(this)
    this.subscribeToMutations = this.subscribeToMutations.bind(this)
    this.unsubscribeFromMutations = this.unsubscribeFromMutations.bind(this)

    this.forms = this.scan()
  }

  /**
   * Get all relevant inputs and buttons (or button-like elements) contained in the element.
   */
  private getInputs (root: Document | Element): [InputType[], SubmitType[]] {
    const inputs: InputType[] = []
    const submits: SubmitType[] = []
    for (const element of root.querySelectorAll(ELEMENT_SELECTORS)) {
      // Filter out unwanted elements
      if (element instanceof HTMLButtonElement && element.type !== 'submit')
        continue
      if (
        element instanceof HTMLAnchorElement &&
        element.outerHTML.match(SUBMIT_MATCHER) !== null
      )
        continue

      if (element instanceof HTMLInputElement) {
        // Input type elements
        inputs.push(element)
      } else if (
        element instanceof HTMLButtonElement ||
        element instanceof HTMLAnchorElement
      ) {
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

  private getFormType (
    form: HTMLElement,
    inputs: InputType[],
    submits: SubmitType[]
  ) {
    // TODO: Implement matchers
    return FormType.Unknown
  }

  private filterSubmits (submits: SubmitType[]): SubmitType[] {
    const scores: Map<SubmitType, number> = new Map()
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
    const bestMatches: [number, SubmitType[]] = [...scores].reduce(
      ([maxScore, elements], [element, score]) =>
        score > maxScore
          ? [score, [element]] // Replace max score
          : score === maxScore
          ? [maxScore, [element, ...elements]]
          : [maxScore, elements],
      [0, []] as [number, SubmitType[]]
    )
    return bestMatches[1]
  }

  /**
   * Filter out less interesting forms such as forms with no submit button
   * or forms that only contain hidden inputs.
   * @param forms List of unfiltered forms.
   */
  private filterForms (forms: Forms, filters: FormFilter[]) {
    return new Map(
      [...forms].filter(([form, formValues]) => {
        for (const filter of filters) {
          if (!filter(form, formValues)) return false
        }
        return true
      })
    )
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
    inputs: InputType[],
    submits: SubmitType[]
  ): Forms {
    const formElements = root.querySelectorAll('form')
    const formInputs = this.mapParentForm<InputType>(formElements, inputs)
    const formSubmits = this.mapParentForm<SubmitType>(formElements, submits)

    const forms: Forms = new Map()
    // Merge inputs and submits into forms
    for (const [form, inputElements] of formInputs) {
      // Should be same forms as inputs, either way a form without inputs isn't interesting
      const submitElements = formSubmits.has(form)
        ? this.filterSubmits(formSubmits.get(form))
        : []
      forms.set(form, {
        type: this.getFormType(form, inputs, submits),
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
    inputs: InputType[],
    submits: SubmitType[]
  ): Forms {
    const inputGroups = this.mapCommonElements<InputType>(
      inputs,
      [...inputs, ...submits],
      root
    )
    const submitGroups = this.mapCommonElements<SubmitType>(
      submits,
      [...inputs, ...submits],
      root
    )

    const forms: Forms = new Map()
    for (const [pseudoForm, inputElements] of inputGroups) {
      const submitElements = submitGroups.has(pseudoForm)
        ? this.filterSubmits(submitGroups.get(pseudoForm))
        : []
      forms.set(pseudoForm, {
        type: this.getFormType(pseudoForm, inputElements, submitElements),
        inputElements,
        submitElements
      })
    }

    // Sort by least amount of elements
    return new Map(
      [...forms].sort(
        ([k1, v1], [k2, v2]): number =>
          v1.inputElements.length +
          v1.submitElements.length -
          (v2.inputElements.length + v2.submitElements.length)
      )
    )
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
      unmatchedForm.inputElements,
      unmatchedForm.submitElements
    )

    // Filter out unwanted forms
    forms = this.filterForms(forms, [
      formFilters.hasSubmit,
      formFilters.notHidden
    ])
    pseudoForms = this.filterForms(pseudoForms, [
      formFilters.singleSubmit,
      formFilters.notHidden
    ])
    return new Map([...forms, ...pseudoForms])
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

  /**
   * Decide whether or not the update nodes should trigger a re-scan of the page.
   * @param nodes Nodes which were updated in DOM.
   */
  private shouldUpdate (nodes: NodeList): boolean {
    for (const node of nodes) {
      if (this.hasForm(node)) {
        return true
      }
    }
  }

  private onMutation (mutationsList: MutationRecord[]): Forms {
    let forms: Forms = new Map()
    for (const mutation of mutationsList) {
      if (this.shouldUpdate(mutation.addedNodes)) {
        for (const node of mutation.addedNodes) {
          forms = new Map([...forms, ...this.scan(node as HTMLElement)])
        }
      }
    }
    return forms
  }

  subscribeToMutations (listener?: (forms: Forms) => void): void {
    if (this.observer === null) {
      this.observer = new MutationObserver((mutations) => {
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
