import Logger from "../../../utils/Logger"
import { logger as searchLogger } from '.'

const logger = new Logger('Tab', searchLogger)

export class TabHandler {
  private static handlers: Map<number, TabHandler> = new Map()

  static StartTracking () {
    browser.tabs.onUpdated.addListener(TabHandler.OnUpdated)
    browser.tabs.onRemoved.addListener(TabHandler.OnRemoved)
  }

  static OnUpdated (tabId: number, changeInfo: { url: string }) {
    let handler = TabHandler.handlers.get(tabId)
    if (handler === undefined) {
      handler = new TabHandler(changeInfo.url)
      TabHandler.handlers.set(tabId, handler)
    }
    // TODO: Search
  }

  static OnRemoved (tabId: number) {
    let handler = TabHandler.handlers.get(tabId)
    if (handler === undefined) {
      // TODO: Remove log statement after testing whether only the expected cases
      // end up here (closing tab which pre-existed the session).
      logger.error('No handler available for tab `%d`', tabId)
      return
    }
    // TODO: Remove search results for tab
  }

  private url: string
  private domain: string

  constructor (url: string) {
    this.url = url
    const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^/]*)\//i)
    this.domain =  match !== null ? match[1] : url
  }
}
