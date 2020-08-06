interface FrameProps {
  id: string
  style: Record<string, string>
  src?: string
  body?: Node
  head?: Node
}

const STOREDSAFE_ROOT = 'storedsafe-extension-root'
const STOREDSAFE_SAVE = 'storedsafe-extension-add'
const STOREDSAFE_TOGGLE = 'storedsafe-extension-toggle'

function getFrame (id = STOREDSAFE_ROOT): Element {
  return document.getElementById(id)
}

function getRoot (): Element {
  let root = getFrame()
  if (root === null) {
    root = document.createElement('div')
    root.id = STOREDSAFE_ROOT
    document.body.appendChild(root)
  }
  return root
}

async function drawFrame ({ id, style, src }: FrameProps): Promise<void> {
  const root = getRoot()
  let iframe = document.getElementById(id) as HTMLIFrameElement
  if (iframe === null) {
    iframe = document.createElement('iframe')
    iframe.id = id
  } else {
    console.warn('STOREDSAFE: Trying to create already existing iframe', { id, src })
  }
  iframe.src = src
  iframe.style.setProperty('overflow', 'hidden')
  iframe.style.setProperty('border', '0')
  iframe.style.setProperty('z-index', '99999')
  for (const prop in style) {
    iframe.style.setProperty(prop, style[prop])
  }
  root.appendChild(iframe)
  return await new Promise(resolve => {
    iframe.addEventListener('load', () => resolve())
  })
}

/**
 * Remove an injected frame from the DOM tree.
 * Default removes the whole StoredSafe inject root from the page.
 * @param id - ID of node to be removed (default StoredSafe root)
 */
export function removeFrame (id = STOREDSAFE_ROOT): void {
  const frame = document.getElementById(id)
  if (frame !== null) {
    frame.remove()
  } else {
    console.warn('STOREDSAFE: Trying to remove iframe that doesn\'t exist', { id })
  }
}

/**
 * Draw the add prompt on the page.
 * @param values Values submitted by form.
 */
export async function drawPopup (): Promise<void> {
  return await drawFrame({
    id: STOREDSAFE_SAVE,
    style: {
      width: '360px',
      maxHeight: '400px',
      height: '90vh',
      background: 'transparent',
      position: 'absolute',
      top: '20px',
      right: '20px'
    },
    src: browser.runtime.getURL('index.html') + '#save'
  })
}

export async function drawToggle (): Promise<void> {
  return await drawFrame({
    id: STOREDSAFE_TOGGLE,
    style: {
      width: '100px',
      height: '50px',
      position: 'fixed',
      bottom: '50px',
      right: '50px'
    },
    src: browser.runtime.getURL('index.html') + '#toggle'
  })
}

const port = browser.runtime.connect()
port.onMessage.addListener(
  ({
    sender,
    type,
    data
  }: {
    sender: string
    type: string
    data?: unknown
  }) => {
    console.log('PORT MESSAGE', type, sender, data)
    switch (type) {
      case 'save.open': {
        drawPopup()
        break
      }
      case 'save.close': {
        removeFrame(STOREDSAFE_SAVE)
        break
      }
    }
  }
)
