import type { Message } from '../../global/messages'

const IFRAME_ROOT = 'com.storedsafe.extension'
const BASE_STYLE: Record<string, string> = {
  border: '0',
  padding: '0',
  margin: '0',
  position: 'fixed',
  top: '10px',
  right: '10px',
  'max-width': 'calc(100vw - 20px)',
  'max-height': 'calc(100vh - 20px)',
  'z-index': '2147483646',
  transition: 'height 0.5s, width 0.5s'
}

function getRoot (): HTMLElement {
  return getFrame(
    IFRAME_ROOT,
    document.body,
    IFRAME_ROOT,
    {
      'z-index': '2147483646'
    },
    ''
  )
}

/**
 * Get a frame on the page or create it if it doesn't exist.
 * If called from a context where you know the frame exists, the options
 * used to create the frame can be skipped.
 * @param id Unique identifier for the frame relative to the entire DOM.
 * @param parent Parent element to append the frame to if it doesn't exist.
 * @param frameType Element type of the frame if it doesn't exist.
 * @param style Styles to be applied to the element if it doesn't exist.
 * @param prefix Prefix to put in front of the name to ensure it stands out from other DOM elements.
 */
function getFrame<T extends HTMLElement> (
  id: string,
  parent?: HTMLElement,
  frameType?: string,
  style?: Record<string, string>,
  prefix = IFRAME_ROOT + '_'
): T {
  id = prefix + id
  let frame: T = document.getElementById(id) as T
  if (!frame && !!parent && !!frameType) {
    frame = document.createElement(frameType) as T
    frame.id = id
    style = style ?? {}
    for (const prop in style) {
      frame.style.setProperty(prop, style[prop])
    }
    parent.appendChild(frame)
  }
  return frame
}

function closeFrame (id: string): void {
  const frame = getFrame(id)
  if (!!frame) frame.remove()
  const root = getRoot()
  if (root.childElementCount === 0) root.remove()
}

/**
 * Create an iframe on the page and set the source to `<extension-url>/index.html#<id>`.
 * Places all iframes inside a common extension container as to not clutter the DOM of the page.
 * @param id Unique identifier of the frame.
 * @param style Initial styles to be applied on top of the base frame styles.
 */
export function createIframe (id: string, style: Record<string, string> = {}) {
  const root = getRoot()
  const iframe = getFrame<HTMLIFrameElement>(id, root, 'iframe', {
    ...BASE_STYLE,
    ...(style ?? {})
  })
  iframe.src = browser.runtime.getURL('index.html') + `#${id}`
}

export function onIframeMessage (message: Message) {
  console.log('IFRAME MESSAGE %o', message)
  if (message.context === 'iframe') {
    switch (message.action) {
      case 'resize': {
        const { id, width, height } = message.data
        const frame = getFrame(id)
        if (height !== undefined) frame.style.setProperty('height', height)
        if (width !== undefined) frame.style.setProperty('width', width)
        break
      }
      case 'create': {
        const { id, style } = message.data
        createIframe(id, style)
        break
      }
      case 'close': {
        const { id } = message.data
        closeFrame(id)
        break
      }
    }
  }
}
