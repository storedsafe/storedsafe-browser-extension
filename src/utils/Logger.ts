/**
 * This module provides a custom logger to be used throughout the application.
 * It adds two primary features:
 *   1. Colored messages per logger instance with assigned names for increased
 *      readability. Uses a hash value of the assigned name to generate a color
 *      so that the same name will always have the same color for consistency.
 *   2. Single point of entry for logging, allows logging levels to be adjusted
 *      more easily later on so that logging can be toggled instead of being
 *      added/removed as needed.
 *
 * The console.log function can be used in two different ways. Either in a printf-like
 * manner where the first parameter is the message and subsequent parameters are variables;
 * or in a way where each parameter gets printed after the other.
 *   Since this logger uses the printf style to achieve colors, modules that use the logger
 * are also resticted to the printf-style. Meaning the first parameter is always the message
 * and subsequent parameters are variables which are injected into special characters in the
 * messages such as %o for object, %s for string and %d for number.
 */

// Print this in front of all log messages
const PREFIX = 'StoredSafe'

// Base style for colored messages
const baseStyle = [
  'color: #fff',
  'background-color: #526A78',
  'padding: 2px 4px',
  'border-radius: 2px'
].join(';')

// Specific coloring for special tags, extends base style
const depthStyle = [baseStyle, 'background-color: #f59815'].join(';')
const tableStyle = [baseStyle, 'background-color: #D65780'].join(';')

/**
 * Print a message to the console.
 * @param message - Message to be printed.
 * @param variables - Variables to be injected into message string.
 */
type LogFunction = (message: any, ...variables: any[]) => void

/**
 * Wraps logging to print more informative messages to the console.
 */
class Logger {
  groupDepth = 0
  name: string
  nameStyle: string
  parent?: Logger = null
  enabled: boolean

  constructor (
    name: string,
    parent: Logger = StoredSafeLogger,
  ) {
    this.name = name
    this.parent = parent
    this.enabled = this.parent === null ? true : this.parent.enabled

    if (this.parent === null) {
      this.nameStyle = baseStyle
    } else {
      // Generate a color based on the name to make it easy to identify
      const hash =
        this.name.split('').reduce((a, x) => a + x.charCodeAt(0), 0) * 93
      const color = `hsl(${hash % 360}, ${(hash % 50) + 20}%, ${(hash % 30) +
        20}%)`
      this.nameStyle = [baseStyle, `background-color: ${color}`].join(';')
    }
  }

  /**
   * Helper function to determine whether an open console.group is active.
   */
  private _isGrouped () {
    return this.groupDepth > 0
  }

  private _namePrefix(): [string, string[]] {
    let parentPrefix: string = '', parentStyle: string[] = []
    if (this.parent !== null) {
      [parentPrefix, parentStyle] = this.parent._namePrefix()
    }
    return [
      `${parentPrefix}%c${this.name}`,
      [...parentStyle, this.nameStyle]
    ]
  }

  /**
   * Helper function to generate colored tags.
   * Prints the application name, the module name and optionally a tag name and
   * then resets the style (or applies the provided style) for the actual message.
   * @param tag Extra tag to be added before message.
   * @param tagStyle Style for extra tag.
   * @param style Style of the message.
   */
  private _prefix (tag = '', tagStyle = '', style = ''): [string, string[]] {
    const [namePrefix, nameStyle] = this._namePrefix()
    return [
      `${namePrefix}%c${tag}%c: `,
      [...nameStyle, tagStyle, style]
    ]
  }

  /**
   * Start a console group, causing an indented block for subsequent log messages.
   * Cancel with Logger.groupEnd.
   * @param title Title of the group for better readability.
   */
  group (title = '') {
    if (!this.enabled) return
    this.groupDepth += 1
    const [prefix, styles] = this._prefix(
      `G${this.groupDepth} - ${title}`,
      depthStyle
    )
    console.group(prefix, ...styles)
  }

  /**
   * Same as Logger.group, but start the group collapsed.
   * Cancel with Logger.groupEnd.
   * @param title Title of the group for better readability.
   */
  groupCollapsed (title = '') {
    if (!this.enabled) return
    this.groupDepth += 1
    const [prefix, styles] = this._prefix(
      `G${this.groupDepth} - ${title}`,
      depthStyle
    )
    console.groupCollapsed(prefix, ...styles)
  }

  /**
   * End a console group, reverting indentation of Logger.group.
   */
  groupEnd () {
    if (!this.enabled) return
    if (this._isGrouped()) {
      this.groupDepth -= 1
      console.groupEnd()
    }
  }

  /**
   * Send a standard log message to the console.
   * @param message Message to be logged.
   * @param variables Values to be injected into message.
   */
  log (message: any, ...variables: any[]) {
    if (!this.enabled) return
    const [prefix, styles] = this._prefix()
    console.log(prefix + message, ...styles, ...variables)
  }

  /**
   * Send an info message to the console.
   * @param message Message to be logged.
   * @param variables Values to be injected into message.
   */
  info (message: any, ...variables: any[]) {
    if (!this.enabled) return
    const [prefix, styles] = this._prefix()
    console.info(prefix + message, ...styles, ...variables)
  }

  /**
   * Send a warning message to the console.
   * @param message Message to be logged.
   * @param variables Values to be injected into message.
   */
  warn (message: any, ...variables: any[]) {
    if (!this.enabled) return
    const [prefix, styles] = this._prefix()
    console.warn(prefix + message, ...styles, ...variables)
  }

  /**
   * Send an error message to the console.
   * @param message Message to be logged.
   * @param variables Values to be injected into message.
   */
  error (message: any, ...variables: any[]) {
    if (!this.enabled) return
    const [prefix, styles] = this._prefix()
    console.error(prefix + message, ...styles, ...variables)
  }

  /**
   * Send a debug message to the console.
   * @param message Message to be logged.
   * @param variables Values to be injected into message.
   */
  debug (message: any, ...variables: any[]) {
    if (!this.enabled) return
    const [prefix, styles] = this._prefix()
    console.debug(prefix + message, ...styles, ...variables)
  }

  /**
   * Present an object as a table in the console.
   * @param obj Object to be presented.
   */
  table (obj: any) {
    if (!this.enabled) return
    const [prefix, styles] = this._prefix('table', tableStyle)
    console.log(prefix, ...styles)
    console.table(obj)
  }

  enable() {
    this.enabled = true
  }

  disable() {
    this.enabled = false
  }
}

export const StoredSafeLogger = new Logger(PREFIX, null)

export default Logger
