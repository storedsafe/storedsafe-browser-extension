/**
 * Format for messages between scripts.
 */
interface Message {
  type: string
  data?: any
}

interface SaveValues {
  url: string
  name: string
  [key: string]: string
}
