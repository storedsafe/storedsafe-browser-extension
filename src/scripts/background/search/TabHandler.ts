import Logger from '../../../utils/Logger'
import { logger as searchLogger } from '.'
import { urlToNeedle, find } from './searchTools'
import StoredSafeError from '../../../utils/StoredSafeError'

const logger = new Logger('Tab', searchLogger)

class StoredSafeTabHandlerError extends StoredSafeError {}

export class TabHandler {
  private static handlers: Map<number, TabHandler> = new Map()

  private results: Results
  private tabId: number
  private url: string

  static StartTracking (): void {
    browser.tabs.onUpdated.addListener(TabHandler.OnUpdated)
    browser.tabs.onRemoved.addListener(TabHandler.OnRemoved)
  }

  static Clear (): void {
    for (const handler of TabHandler.handlers.values()) {
      handler.results = new Map()
    }
  }

  static PurgeHost (purgeHost: string): void {
    for (const handler of TabHandler.handlers.values()) {
      for (const host of handler.results.keys()) {
        if (host === purgeHost) handler.results.delete(host)
      }
    }
  }

  static OnUpdated (
    tabId: number,
    changeInfo: { url: string },
    tab: browser.tabs.Tab
  ) {
    if (changeInfo.url === undefined) return

    let handler = TabHandler.handlers.get(tabId)
    if (handler === undefined) {
      handler = new TabHandler(tabId, changeInfo.url)
      TabHandler.handlers.set(tabId, handler)
    }

    const previousUrl = handler.url
    const shortUrl = urlToNeedle(tab.url)
    if (previousUrl !== shortUrl) {
      handler.find()
    }
  }

  static OnRemoved (tabId: number) {
    let handler = TabHandler.handlers.get(tabId)
    if (handler === undefined) {
      return
    }
  }

  static GetResults (tabId: number): Results {
    return TabHandler.handlers.get(tabId)?.results
  }

  constructor (tabId: number, url: string) {
    this.find = this.find.bind(this)

    this.tabId = tabId
    this.url = url
  }

  private find () {
    find(urlToNeedle(this.url))
      .then(results => {
        this.results = results
        browser.browserAction
          .setBadgeText({
            text: this.results.size.toString(),
            tabId: this.tabId
          })
          .catch(error => {
            throw new StoredSafeTabHandlerError(
              'Unable to update badge text with search results.'
            )
          })
      })
      .catch(error => {
        throw new StoredSafeTabHandlerError(
          'Unable to fetch search results from StoredSafe.'
        )
      })
  }
}
