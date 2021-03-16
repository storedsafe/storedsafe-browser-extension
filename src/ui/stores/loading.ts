import { Readable, writable } from 'svelte/store'
import {
  StoredSafeBaseError,
  StoredSafeExtensionError
} from '../../global/errors'
import { getMessage, LocalizedMessage } from '../../global/i18n'
import { Logger } from '../../global/logger'

const logger = new Logger('loading')

interface LoadingState {
  /** `true` if any promises are currently being processed. */
  isLoading: boolean

  /**
   * Check for the presence of one or more partial loading IDs.
   * @example "Main.Loading.123" returns `true` for `searchIds = ["Main"]`
   * @param searchIds Search strings potentially matching loading IDs.
   * @returns `true` if match is found.
   */
  has: (...ids: string[]) => boolean
}

interface LoadingStore extends Readable<LoadingState> {
  add: <T>(
    id: string,
    promise: Promise<any>,
    listeners?: {
      onSuccess?: (value: T) => void
      onError?: (error: Error) => void
    }
  ) => void
  cancel: (id: string) => void
}

/**
 * Wraps the state of a single promise.
 * If the cancel method is called, all callbacks will be ignored.
 */
class LoadingPromise<T> {
  private canceled = false

  /**
   * Wrap a promise with callbacks.
   * @param promise The promise to be handled.
   * @param onSuccess Called if the promise is successfully processed.
   * @param onError Called if the promise throws an error.
   * @param finished Called when the promise has finished, regardless of success.
   */
  constructor(
    promise: Promise<any>,
    onSuccess: (value: T) => void | undefined,
    onError: (error: Error) => void | undefined,
    finished: () => void
  ) {
    this.cancel = this.cancel.bind(this)

    promise
      .then((value: T) => {
        if (!this.canceled) {
          onSuccess?.(value)
          finished()
        }
      })
      .catch(error => {
        if (!this.canceled) {
          if (error instanceof StoredSafeBaseError) {
            onError(error)
          } else {
            logger.error(error)
            onError(
              new StoredSafeExtensionError(
                getMessage(LocalizedMessage.LOADING_UNKNOWN_ERROR),
                error
              )
            )
          }
          finished()
        }
      })
  }

  cancel(): void {
    this.canceled = true
  }
}

/**
 * Keeps track of the loading state across one or more promises and issues callbacks once
 * individual promises are completed.
 */
function loadingStore(): LoadingStore {
  const promises: Map<string, LoadingPromise<any>> = new Map()

  const { subscribe, set } = writable<LoadingState>({
    isLoading: false,
    has: () => false
  })

  /**
   * Update the `loadingStore` state.
   */
  function update() {
    const ids = [...promises.keys()]
    set({
      isLoading: promises.size !== 0,
      has: (...searchIds: string[]) =>
        searchIds.reduce(
          (hasAnyId, searchId) =>
            hasAnyId ||
            ids.reduce((hasId, id) => hasId || !!id.match(searchId), false),
          false
        )
    })
  }

  /**
   * Returns a function to be called by a `LoadingPromise` when the promise is finished,
   * regardless of whether it completes successfully or not.
   * @param id ID associated with promise.
   */
  function finished(id: string): () => void {
    return function () {
      promises.delete(id)
      update()
    }
  }

  return {
    subscribe,

    /**
     * Add a promise for which the loading state should be handled.
     * @param id ID associated with the promise, used for canceling/overwriting promises.
     * @param promise The promise to be handled.
     * @param listeners Callbacks for success/error states on `promise`.
     */
    add: function (id, promise, listeners): void {
      if (promises.has(id)) {
        promises.get(id).cancel()
      }
      const onSuccess = listeners?.onSuccess
      const onError = listeners?.onError
      promises.set(
        id,
        new LoadingPromise(promise, onSuccess, onError, finished(id))
      )
      update()
    },

    /**
     * Cancel a running promise, discarding the loading state and callbacks for that promise.
     * @param id ID associated with promise to be canceled.
     */
    cancel: function (id) {
      promises.get(id).cancel()
      promises.delete(id)
      update()
    }
  }
}

export const loading = loadingStore()
