/**
 * Handles the state of an asynchronous request.
 * */
import { useState, useEffect } from 'react';

/**
 * @param data - The returned data by the promise.
 * @param isLoading - Whether or not the promise has finished its task.
 * @param error - If the promise fails, present the error.
 * */
interface State<T> {
  data?: T;
  isLoading: boolean;
  error?: Error;
}

/**
 * @param dispatch - Dispatch a new promise to be handled.
 * */
interface PromiseHook<T> extends State<T> {
  dispatch: (promise: Promise<T>) => void;
}

/**
 * Handle the state of the lifecycle of a promise.
 * @param initialPromise - Optional initial promise to be dispatched.
 * */
export const usePromise = <T>(initialPromise?: Promise<T>): PromiseHook<T> => {
  const [state, setState] = useState<State<T>>({ isLoading: false });
  const [promise, setPromise] = useState<Promise<T>>(initialPromise);

  useEffect(() => {
    let mounted = true;
    if (promise) {
      setState({ isLoading: true });
      promise.then((data) => {
        if (mounted) {
          setState({
            data,
            isLoading: false,
          });
        }
      }).catch((error) => {
        if (mounted) {
          setState({
            error,
            isLoading: false,
          });
        }
      });
    }

    return (): void => { mounted = false };
  }, [promise]);

  const dispatch = (newPromise: Promise<T>): void => {
    if (promise) {
      promise.then(() => {
        setPromise(newPromise);
      });
    } else {
      setPromise(newPromise);
    }
  };

  return {
    dispatch,
    ...state
  }
};
