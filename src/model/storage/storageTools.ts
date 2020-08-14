import { string } from 'yargs'
import StoredSafeError from '../../utils/StoredSafeError'
import Logger from '../../utils/Logger'

type StorageListener<T> = (value: T) => void
type GetFunction<T> = () => Promise<T>
type AreaName = 'local' | 'sync' | 'managed'

export class StorageChangeListener<T> {
  private logger: Logger
  private key: string
  private areas: AreaName[]
  private get: GetFunction<T>

  private listeners: StorageListener<T>[] = []

  constructor (
    key: string,
    get: GetFunction<T>,
    areas: AreaName[] = ['local', 'sync', 'managed']
  ) {
    // Make sure JS remembers what `this` is
    this.notify = this.notify.bind(this)
    this.onChanged = this.onChanged.bind(this)
    this.addListener = this.addListener.bind(this)
    this.removeListener = this.removeListener.bind(this)

    this.logger = new Logger(`StorageChange - ${key}`)
    this.key = key
    this.areas = areas
    this.get = get

    // Subscribe to changes in storage
    browser.storage.onChanged.addListener(this.onChanged)
  }

  private async notify (): Promise<void> {
    try {
      const values = await this.get()
      for (const listener of this.listeners) {
        listener(values)
      }
    } catch (error) {
      this.logger.error(
        'Error pushing `%s` change from storage. %o',
        this.key,
        error
      )
    }
  }

  private onChanged (
    changes: { [key: string]: browser.storage.StorageChange },
    areaName: AreaName
  ): void {
    if (this.areas.includes(areaName) && changes.hasOwnProperty(this.key)) {
      void (async () => {
        await this.notify()
      })()
    }
  }

  addListener (listener: StorageListener<T>): void {
    if (!this.listeners.includes(listener)) this.listeners.push(listener)
  }

  removeListener (listener: StorageListener<T>): void {
    const index = this.listeners.indexOf(listener)
    if (index !== -1) {
      this.listeners.splice(index, 1)
    }
  }
}
