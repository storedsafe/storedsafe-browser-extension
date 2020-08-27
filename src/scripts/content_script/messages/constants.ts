// Unique IDs for identifying message origins
export const PORT_SAVE = 'save'
export const PORT_FILL = 'fill'
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