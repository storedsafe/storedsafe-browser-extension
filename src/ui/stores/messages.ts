import { Readable, writable } from 'svelte/store'

/**
 * The type of message to be displayed, affects the appearance of the message.
 */
export enum MessageType {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * How long the message should be displayed.
 */
export enum Duration {
  NO_LIMIT,
  SHORT,
  MEDIUM,
  LONG
}

const durations = {
  [Duration.SHORT]: 3e3,
  [Duration.MEDIUM]: 6e3,
  [Duration.LONG]: 12e5
}

/**
 * Definition of a message.
 */
export interface Message {
  message: string
  messageType: MessageType
  id: number
}

export interface MessageStore extends Readable<Message[]> {
  add: (message: any, messageType: MessageType, duration?: Duration) => number
  remove: (id: number | CustomEvent<number>) => void
  clear: () => void
}

/**
 * Custom message store definition.
 */
export function messageStore (): MessageStore {
  const timers = new Map<number, number>()
  const { subscribe, set, update } = writable([])

  // Counter used to generate message IDs
  let count: number = 0

  return {
    subscribe,

    /**
     * Add a message to the store.
     * @param message Contents of the message.
     * @param messageType Appearance of the message.
     */
    add (message, messageType, duration = Duration.NO_LIMIT) {
      const id = count++
      update(messages => [...messages, { message, messageType, id }])

      if (duration !== Duration.NO_LIMIT) {
        timers.set(
          id,
          window.setTimeout(() => this.remove(id), durations[duration])
        )
      }
      return id
    },

    /**
     * Remove a message from the store.
     * @param id ID (or dispatch event containg ID) of the message to be removed.
     */
    remove (id) {
      if (id instanceof CustomEvent) id = id.detail
      if (timers.has(id)) {
        clearTimeout(timers.get(id))
        timers.delete(id)
      }
      update(messages => messages.filter(message => message.id !== id))
    },

    /**
     * Clear all messages from the store.
     */
    clear () {
      set([])
    }
  }
}

/** Global messages */
export const messages = messageStore()
