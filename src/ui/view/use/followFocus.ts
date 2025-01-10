const SELECTOR = 'input,select,textarea,button'

export function followFocus (node: HTMLElement) {
  function handleFocus (e: FocusEvent) {
    ;(e.target as HTMLElement).scrollIntoView({ block: 'center' })
  }

  function addListeners () {
    for (const element of node.querySelectorAll(SELECTOR)) {
      element.addEventListener('focus', handleFocus)
    }
  }

  function removeListeners () {
    for (const element of node.querySelectorAll(SELECTOR)) {
      element.removeEventListener('focus', handleFocus)
    }
  }

  const observer = new MutationObserver(() => {
    removeListeners()
    addListeners()
  })
  observer.observe(node, { subtree: true, childList: true })

  addListeners()

  return {
    destroy () {
      removeListeners()
    }
  }
}
