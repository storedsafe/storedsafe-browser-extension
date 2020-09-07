// Unique IDs for identifying message origins
export const PORT_SAVE_PREFIX = 'save_'
export const PORT_SAVE_CONNECTED = `${PORT_SAVE_PREFIX}connected`
export const PORT_SAVE_CLOSE = `${PORT_SAVE_PREFIX}close`
export const PORT_SAVE_RESIZE = `${PORT_SAVE_PREFIX}resize`

export const PORT_FILL_PREFIX = 'fill_'
export const PORT_FILL_CONNECTED = `${PORT_FILL_PREFIX}connected`
export const PORT_FILL_CLOSE = `${PORT_FILL_PREFIX}close`
export const PORT_FILL_RESIZE = `${PORT_FILL_PREFIX}resize`
export const PORT_FILL_FILL = `${PORT_FILL_PREFIX}fill`

export const PORT_CONTENT = 'content_script'

// Unique IDs used for identifying iframes
export const SAVE_FRAME_ID = 'com-storedsafe-save'
export const FILL_FRAME_ID = 'com-storedsafe-fill'

// The available user flows.
// Message types should hold the form <flow>.<action>, for example save.open
export const FLOW_SAVE = 'save'
export const FLOW_FILL = 'fill'

//// Common actions
// background -> content_script
export const ACTION_OPEN = 'open' // Open iframe
// iframe -> background -> content_script
export const ACTION_CLOSE = 'close' // Close iframe
export const ACTION_RESIZE = 'resize' // Resize iframe
// background -> iframe
export const ACTION_POPULATE = 'populate' // Pass background data to iframe after open

// content_script -> background or popup -> background
export const ACTION_INIT = 'init' // Initiate flow with data

// background -> content_script
export const ACTION_FILL = 'fill'