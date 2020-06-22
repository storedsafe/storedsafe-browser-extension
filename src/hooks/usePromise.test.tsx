/**
 * Testing the usePromise hook using a component written specifically for this
 * test. usePromise should accept a dispatch of a promise and then present the
 * lifecycle of that promise.
 * */
import React, { useEffect } from 'react';
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { usePromise } from './usePromise';

/**
 * @param promise - The promise to be passed to usePromise.
 * @param useDispatch - Whether to use dispatch or hook parameter.
 * */
interface AppProps {
  promise: Promise<number>;
  useDispatch: boolean;
}

/**
 * Example implementation for testing purposes.
 * */
const App: React.FunctionComponent<AppProps> = ({
  promise,
  useDispatch,
}: AppProps) => {
  const initialValue = useDispatch ? undefined : promise;
  const { dispatch, data, isLoading, error } = usePromise<number>(initialValue);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (useDispatch) dispatch(promise); }, []);

  return (
    <main>
      <p id="isLoading">{isLoading.toString()}</p>
      <p id="error">{error ? error.message : ''}</p>
      <p id="data">{data}</p>
    </main>
  );
};

/**
 * Set up and tear down container to mount tested component in.
 * */
let container: Element = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
});
afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

/**
 * Helper function to create a promise and expose the reject and response
 * methods so the promise can be manually rejected/resolved from outside of
 * the promise.
 * */
function makePromise(): {
  promise: Promise<number>;
  resolve: (value: number) => void;
  reject: (error: Error) => void;
} {
  let resolve, reject;
  const promise = new Promise<number>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject }
}

/**
 * Helper function to extract the relevant HTML elements from the container.
 * */
function getElements(): {
  isLoading: HTMLElement;
  error: HTMLElement;
  data: HTMLElement;
} {
  return {
    isLoading: container.querySelector('#isLoading'),
    error: container.querySelector('#error'),
    data: container.querySelector('#data'),
  };
}

test('usePromise(initial), success', async () => {
  const { promise, resolve } = makePromise();
  await act(async () => {
    render(<App promise={promise} useDispatch={false} />, container);
  });
  const { isLoading,  error, data } = getElements();
  expect(isLoading.innerHTML).toEqual('true');

  await act(async () => {
    resolve(5);
  });
  return promise.then((value) => {
    expect(isLoading.innerHTML).toEqual('false');
    expect(error.innerHTML).toEqual('');
    expect(data.innerHTML).toEqual(value.toString());
  });
});

test('usePromise(initial), error', async () => {
  const { promise, reject } = makePromise();
  await act(async () => {
    render(<App promise={promise} useDispatch={false} />, container);
  });
  const { isLoading,  error, data } = getElements();
  expect(isLoading.innerHTML).toEqual('true');

  await act(async () => {
    reject(new Error('invalid'));
  });
  return promise.catch((err) => {
    expect(isLoading.innerHTML).toEqual('false');
    expect(error.innerHTML).toEqual(err.message);
    expect(data.innerHTML).toEqual('');
  });
});

test('usePromise(dispatch), success', async () => {
  const { promise, resolve } = makePromise();
  await act(async () => {
    render(<App promise={promise} useDispatch={true} />, container);
  });
  const { isLoading,  error, data } = getElements();
  expect(isLoading.innerHTML).toEqual('true');

  await act(async () => {
    resolve(5);
  });
  return promise.then((value) => {
    expect(isLoading.innerHTML).toEqual('false');
    expect(error.innerHTML).toEqual('');
    expect(data.innerHTML).toEqual(value.toString());
  });
});

test('usePromise(dispatch), error', async () => {
  const { promise, reject } = makePromise();
  await act(async () => {
    render(<App promise={promise} useDispatch={true} />, container);
  });
  const { isLoading,  error, data } = getElements();
  expect(isLoading.innerHTML).toEqual('true');

  await act(async () => {
    reject(new Error('invalid'));
  });
  return promise.catch((err) => {
    expect(isLoading.innerHTML).toEqual('false');
    expect(error.innerHTML).toEqual(err.message);
    expect(data.innerHTML).toEqual('');
  });
});
