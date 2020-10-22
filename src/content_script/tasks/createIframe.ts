const IFRAME_ROOT = 'com.storedsafe.extension'
const BASE_STYLE: Record<string, string> = {
  border: '0',
  padding: '0',
  margin: '0',
  position: 'fixed',
  top: '10px',
  right: '10px',
  width: '400px',
  height: '300px',
  'z-index': '2147483646'
}

function getRoot (): HTMLElement {
  return getFrame(IFRAME_ROOT, document.body, IFRAME_ROOT, {
    'z-index': '2147483646'
  })
}

function getFrame<T extends HTMLElement> (
  id: string,
  parent: HTMLElement,
  frameType: string,
  style: Record<string, string>
): T {
  let frame: T = document.getElementById(id) as T
  if (!frame) {
    frame = document.createElement(frameType) as T
    frame.id = IFRAME_ROOT
    for (const prop in style) {
      frame.style.setProperty(prop, style[prop])
    }
    parent.appendChild(frame)
  }
  console.log('FRAME %o', frame)
  return frame
}

export function createIframe (id: string, style: Record<string, string>) {
  const root = getRoot()
  console.log('ROOT %o', root)
  const iframe = getFrame<HTMLIFrameElement>(id, root, 'iframe', {
    ...BASE_STYLE,
    ...style
  })
  iframe.src = browser.runtime.getURL('index.html') + `#${id}`
}
