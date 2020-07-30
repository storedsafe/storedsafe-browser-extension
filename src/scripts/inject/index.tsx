interface FrameProps {
  id: string
  style: Record<string, string>
  src?: string
  body?: Node
  head?: Node
}

const STOREDSAFE_ROOT = 'storedsafe-extension-root'
const STOREDSAFE_ADD = 'storedsafe-extension-add'
const STOREDSAFE_TOGGLE = 'storedsafe-extension-toggle'

function getFrame (id = STOREDSAFE_ROOT): Element {
  return document.getElementById(id)
}

function getRoot (): Element {
  let root = getFrame()
  if (root === null) {
    root = document.createElement('div')
    document.body.appendChild(root)
  }
  return root
}

async function drawFrame ({ id, style, src }: FrameProps): Promise<void> {
  const root = getRoot()
  const iframe = document.createElement('iframe')
  iframe.src = src
  iframe.id = id
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
  frame.remove()
}

/**
 * Draw the add prompt on the page.
 * @param values Values submitted by form.
 */
export async function drawPopup (): Promise<void> {
  return await drawFrame({
    id: STOREDSAFE_ADD,
    style: {
      width: '360px',
      maxHeight: '100vh',
      height: '400px',
      position: 'fixed',
      top: '20px',
      right: '20px'
    },
    src: browser.runtime.getURL('index.html') + '#popup'
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

browser.runtime.onMessage.addListener((message, sender) => {
  if (getFrame(STOREDSAFE_ADD) === null) {
    drawPopup().then(() => {
      return browser.runtime.sendMessage({
        type: 'save',
        data: {
          url: 'test.example.com',
          name: 'Test Page',
          username: 'Oscar',
          password: 'secret',
          info: 'testing testing 123'
        }
      })
    }).catch((error) => console.log('STOREDSAFE INJECT ERROR: ', error))
  } else {
    removeFrame(STOREDSAFE_ADD)
  }
})
