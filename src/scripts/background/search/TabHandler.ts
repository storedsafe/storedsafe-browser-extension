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
  private isLoading: boolean = true

  static StartTracking (): void {
    browser.tabs.onActivated.addListener(({ tabId }) => {
      if (TabHandler.handlers.has(tabId)) return
      browser.tabs.get(tabId).then(tab => {
        TabHandler.OnUpdated(tabId, { status: 'complete' }, tab)
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
    changeInfo: { url?: string; status?: string },
    tab: browser.tabs.Tab
  ) {
    // Skip updates if status hasn't updated
    if (changeInfo.status !== 'complete') return
    // Skip updates when there is no url
    if (tab.url === undefined || tab.url.length === 0) return

    let handler = TabHandler.handlers.get(tabId)
    if (handler === undefined) {
      handler = new TabHandler(tabId)
      TabHandler.handlers.set(tabId, handler)
    }
    handler.find(tab.url)
  }

  static OnRemoved (tabId: number) {
    let handler = TabHandler.handlers.get(tabId)
    if (handler === undefined) {
      return
    }
  }

  static GetResults (tabId: number, timeout = 5000): Promise<SSObject[]> {
    return new Promise((resolve, reject) => {
      // Set timeout for failure
      const timeoutId = window.setTimeout(() => {
        reject(
          new StoredSafeTabHandlerError('Timeout getting results from tab.')
        )
      }, timeout)

      let handler = TabHandler.handlers.get(tabId)
      if (handler === undefined || handler.isLoading) {
        // If handler doesn't exist yet or is loading, start polling
        const intervalId = window.setInterval(() => {
          handler = TabHandler.handlers.get(tabId)
          if (handler !== undefined && !handler.isLoading) {
            resolve(handler.results)
            window.clearInterval(intervalId)
            window.clearTimeout(timeoutId)
          }
        })
      } else {
        // Return results if handler is done
        resolve(handler.results)
      }
    })
  }

  constructor (tabId: number) {
    this.find = this.find.bind(this)

    this.tabId = tabId
  }

  private updateBadge () {
    const text = this.results.length === 0 ? '' : this.results.length.toString()
    browser.browserAction
      .setBadgeText({
        text,
        tabId: this.tabId
      })
      .catch(error => {
        throw new StoredSafeTabHandlerError(
          'Unable to update badge text with search results.',
          error
        )
      })
  }

  private find (url: string) {
    this.isLoading = true
    find(url)
      .then(results => {
        this.results = results
        this.updateBadge()
      })
      .catch(error => {
        throw new StoredSafeTabHandlerError(
          'Unable to fetch search results from StoredSafe.'
        )
      })
      .then(() => (this.isLoading = false))
  }
}
