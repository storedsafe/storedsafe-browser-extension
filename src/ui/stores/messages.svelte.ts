/**
 * The type of message to be displayed, affects the appearance of the message.
 */
export enum MessageType {
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

/**
 * How long the message should be displayed.
 */
export enum Duration {
  NO_LIMIT = -1,
  SHORT = 5e3,    // 5 seconds
  MEDIUM = 10e3,  // 10 seconds
  LONG = 18e5,     // 30 minutes
}

/**
 * Definition of a message.
 */
export interface Message {
  message: string;
  messageType: MessageType;
  id: number;
}

/**
 * Custom message store definition.
 */
export class Messages {
  timers = new Map<number, number>();

  // Counter used to generate message IDs
  messages: Message[] = $state([]);
  count: number = $derived(this.messages.length);

  /**
   * Add a message to the store.
   * @param message Contents of the message.
   * @param messageType Appearance of the message.
   */
  add(
    message: any,
    messageType: MessageType,
    duration: Duration = Duration.NO_LIMIT
  ) {
    const id = this.count;
    this.messages.push({ message, messageType, id });

    if (duration !== Duration.NO_LIMIT) {
      this.timers.set(
        id,
        window.setTimeout(() => this.remove(id), duration)
      );
    }
    return id;
  }

  /**
   * Remove a message from the store.
   * @param id ID (or dispatch event containg ID) of the message to be removed.
   */
  remove(id: number | CustomEvent<number>) {
    if (id instanceof CustomEvent) id = id.detail;
    if (this.timers.has(id)) {
      clearTimeout(this.timers.get(id));
      this.timers.delete(id);
    }
    this.messages = this.messages.filter((message) => message.id !== id);
  }

  /**
   * Clear all messages from the store.
   */
  clear() {
    this.messages = [];
  }
}

/** Global messages */
export const messages = new Messages();
