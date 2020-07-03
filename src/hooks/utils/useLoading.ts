/**
 * Handle the loading state of a promise and potential errors that arise.
 * Will return the promise and data if any when the promise resolves, however
 * it is preferred to start the chain before sending the promise to the
 * loading hook as it makes the code easier to manage.
 *
 * Example:
 * const [name, setName] = useState<string>()
 * const [state, setPromise, reset] = useLoading<string>()
 * setPromise(api.getName().then(setName))
 *
 * if (state.isLoading) return <p>Loading...</p>
 * if (state.error !== undefined) return <p>Error: {state.error.message}</p>
 * return <p>Hello, {name}</p>
 */
import { useState, useEffect } from 'react'

/**
 * @param isLoading - Whether the promise is currently processing.
 * @param promise - The promise to be processed.
 * @param error - Caught errors, if any.
 * @param data - Resolved data, if any.
 * @param key - Optional identifier to identify what is loading.
 */
interface LoadingState<T> {
  isLoading: boolean
  promise?: Promise<T>
  error?: Error
  data?: T
  key?: any
}

/**
 * @param {0} - State
 * @param {1} - Set promise, start loading sequence
 * @param {2} - Reset, clear promise and errors
 */
type LoadingHook<T> = [
  LoadingState<T>,
  (promise: Promise<T>, key?: any) => void,
  () => void
]

export const useLoading = <T>(): LoadingHook<T> => {
  const [state, setState] = useState<LoadingState<T>>({ isLoading: false })

  useEffect(() => {
    let mounted = true
    if (state.promise !== undefined) {
      state.promise
        .then((data: T) => {
          if (mounted) {
            setState(prevState => ({
              key: prevState.key,
              isLoading: false,
              data
            }))
          }
        })
        .catch(error => {
          if (mounted) {
            setState(prevState => ({
              key: prevState.key,
              isLoading: false,
              error
            }))
          }
        })
    }
    return (): void => {
      mounted = false
    }
  }, [state.promise])

  function setPromise (promise: Promise<T>, key?: any): void {
    setState({
      isLoading: true,
      promise: promise,
      key
    })
  }

  function reset (): void {
    setState({ isLoading: false })
  }

  return [state, setPromise, reset]
}
