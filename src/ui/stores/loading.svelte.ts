import { StoredSafeBaseError, StoredSafeExtensionError } from "@/global/errors";
import { getMessage, LocalizedMessage } from "@/global/i18n";
import { Logger } from "@/global/logger";
import { SvelteMap } from "svelte/reactivity";

const logger = new Logger("loading");

interface LoadingListeners<T> {
  onSuccess?: (value: T) => void;
  onError?: (error: Error) => void;
}

/**
 * Wraps the state of a single promise.
 * If the cancel method is called, all callbacks will be ignored.
 */
class LoadingPromise<T> {
  private canceled = false;

  /**
   * Wrap a promise with callbacks.
   * @param promise The promise to be handled.
   * @param onSuccess Called if the promise is successfully processed.
   * @param onError Called if the promise throws an error.
   * @param finished Called when the promise has finished, regardless of success.
   */
  constructor(
    promise: Promise<any>,
    onSuccess: ((value: T) => void) | undefined,
    onError: ((error: Error) => void) | undefined,
    finished: () => void
  ) {
    this.cancel = this.cancel.bind(this);

    promise
      .then((value: T) => {
        if (!this.canceled) {
          onSuccess?.(value);
          finished();
        }
      })
      .catch((error) => {
        if (!this.canceled) {
          if (error instanceof StoredSafeBaseError) {
            onError?.(error);
          } else {
            logger.error(error);
            onError?.(
              new StoredSafeExtensionError(
                getMessage(LocalizedMessage.LOADING_UNKNOWN_ERROR),
                error
              )
            );
          }
          finished();
        }
      });
  }

  cancel(): void {
    this.canceled = true;
  }
}

/**
 * Keeps track of the loading state across one or more promises and issues callbacks once
 * individual promises are completed.
 */
class Loading {
  promises: Map<string, LoadingPromise<any>> = $state(new SvelteMap());
  isLoading: boolean = $state(false);

  constructor() {
    this.has = this.has.bind(this);
    this.add = this.add.bind(this);
    this.cancel = this.cancel.bind(this);
    this.finished = this.finished.bind(this);
  }

  /**
   * @param searchIDs IDs associated with the promises that progress should be checked for.
   * @returns `true` if any of the searched promises are still in progress.
   */
  has(...searchIDs: string[]) {
    const promiseIDs = this.promises.keys().toArray();
    for (const searchId of searchIDs) {
      if (promiseIDs.includes(searchId)) return true;
    }
    return false;
  }

  /**
   * Add a promise for which the loading state should be handled.
   * @param id ID associated with the promise, used for canceling/overwriting promises.
   * @param promise The promise to be handled.
   * @param listeners Callbacks for success/error states on `promise`.
   */
  add<T>(id: string, promise: Promise<T>, listeners: LoadingListeners<T> = {}) {
    if (this.promises.has(id)) {
      this.promises.get(id)?.cancel();
    }
    const onSuccess = listeners?.onSuccess;
    const onError = listeners?.onError;
    const loadingPromise = new LoadingPromise(
      promise,
      onSuccess,
      onError,
      this.finished(id)
    );
    this.promises.set(id, loadingPromise);
  }

  /**
   * Cancel a running promise, discarding the loading state and callbacks for that promise.
   * @param id ID associated with promise to be canceled.
   */
  cancel(id: string) {
    this.promises.get(id)?.cancel();
    this.promises.delete(id);
  }

  /**
   * Returns a function to be called by a `LoadingPromise` when the promise is finished,
   * regardless of whether it completes successfully or not.
   * @param id ID associated with promise.
   */
  finished(id: string) {
    return () => {
      this.promises.delete(id);
    };
  }
}

export const loading = new Loading();
