/**
 * Wraps the standard Error to automatically name the error after
 * the extending class, providing more informative error messages.
 */
export default class StoredSafeError extends Error {
  constructor(message: string, error?: Error) {
    super(message)
    this.name = this.constructor.name
    this.stack = error?.stack
  }
}