const SELECTOR = "input,select,textarea,button";

export function followFocus(node: HTMLElement) {
  function handleFocus(e: FocusEvent) {
    if (e.target instanceof HTMLElement) {
      e.target.scrollIntoView({ block: "center" });
    }
  }

  function addListeners() {
    for (const element of node.querySelectorAll(SELECTOR)) {
      if (element instanceof HTMLElement) {
        element.addEventListener("focus", handleFocus);
      }
    }
  }

  function removeListeners() {
    for (const element of node.querySelectorAll(SELECTOR)) {
      if (element instanceof HTMLElement) {
        element.removeEventListener("focus", handleFocus);
      }
    }
  }

  const observer = new MutationObserver(() => {
    removeListeners();
    addListeners();
  });
  observer.observe(node, { subtree: true, childList: true });

  addListeners();

  return {
    destroy() {
      removeListeners();
    },
  };
}
