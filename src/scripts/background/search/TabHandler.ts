import Logger from '../../../utils/Logger'
import { logger as searchLogger } from '.'
import { urlToNeedle, find } from './searchTools'
import StoredSafeError from '../../../utils/StoredSafeError'

const logger = new Logger('Tab', searchLogger)

class StoredSafeTabHandlerError extends StoredSafeError {}

export class TabHandler {
  private static handlers: Map<number, TabHandler> = new Map()

  private results: SSObject[]
  private tabId: number
  private url: string

  static StartTracking (): void {
    browser.tabs.onActivated.addListener(({ tabId }) => {
      if (TabHandler.handlers.has(tabId)) return
      browser.tabs.get(tabId).then(tab => {
        TabHandler.OnUpdated(tabId, { url: tab.url }, tab)
      })
    })
    browser.tabs.onUpdated.addListener(TabHandler.OnUpdated)
    browser.tabs.onRemoved.addListener(TabHandler.OnRemoved)
  }

  static Clear (): void {
    for (const handler of TabHandler.handlers.values()) {
      handler.results = []
    }
  }

  static PurgeHost (purgeHost: string): void {
    for (const handler of TabHandler.handlers.values()) {
      handler.results.filter(({ host }) => host === purgeHost)
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
      handler.find(tab.url)
    } else {
      const previousNeedle = urlToNeedle(handler.url)
      const newNeedle = urlToNeedle(tab.url)
      if (previousNeedle !== newNeedle) {
        handler.find(tab.url)
      }
    }
  }

  static OnRemoved (tabId: number) {
    let handler = TabHandler.handlers.get(tabId)
    if (handler === undefined) {
      return
    }
  }

  static GetResults (tabId: number): SSObject[] {
    logger.log('Handlers %o', TabHandler.handlers)
    return TabHandler.handlers.get(tabId)?.results
  }

  constructor (tabId: number, url: string) {
    this.find = this.find.bind(this)

    this.tabId = tabId
    this.url = url
  }

  private find (url: string) {
    this.url = url
    find(url)
      .then(results => {
        this.results = results
        const text = results.length === 0 ? '' : results.length.toString()
        browser.browserAction
          .setBadgeText({
            text,
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
