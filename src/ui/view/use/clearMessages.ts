const SELECTOR = 'input,select,textarea,button'

export function clearMessages (
  node: HTMLElement,
  {
    clear,
    events = ['input']
  }: { clear: () => void; events?: string | string[] }
) {
  events = (typeof events === 'string') ? [events] : events

  function addListeners () {
    for (const element of node.querySelectorAll(SELECTOR)) {
      for (const event of events) {
        element.addEventListener(event, clear)
      }
    }
  }

  function removeListeners () {
    for (const element of node.querySelectorAll(SELECTOR)) {
      for (const event of events) {
        element.removeEventListener(event, clear)
      }
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
