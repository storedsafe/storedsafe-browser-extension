import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import PromiseReducer, { usePromiseReducer } from './PromiseReducer';

/**
* Create reducer function for the promise reducer.
 * */
const init = jest.fn((count) => count);
const increment = jest.fn((count) => count + 1);
const decrementError = new Error('Cannot decrement count any further.');
const invalidError = new Error('Invalid action');

const countReducer: PromiseReducer<number, { type: string }> = (count, action) => {
  switch(action.type) {
    case 'increment': {
      return Promise.resolve(increment(count));
    }
    case 'decrement': {
      if (count > 0) {
        return Promise.resolve(init(count));
      } else {
        return Promise.reject(decrementError);
      }
    }
    case 'init': {
      return Promise.resolve(init(count));
    }
    default: {
      return Promise.reject(invalidError);
    }
  }
};

/**
 * Create component to test reducer in.
 * */
const onSuccess = jest.fn();
const onError = jest.fn();

const App: React.FunctionComponent = () => {
  const { state: count, dispatch } = usePromiseReducer(countReducer, 0);
  const onIncrement = (): void => {
    dispatch({
      type: 'increment',
    }, { onSuccess, onError });
  };
  const onDecrement = (): void => {
    dispatch({
      type: 'decrement',
    }, { onSuccess, onError });
  };
  const onInvalid = (): void => {
    dispatch({
      type: 'invalid',
    }, { onSuccess, onError });
  };
  return (
    <div>
      <p>Count: <span className="count">{count}</span></p>
      <button id="increment" onClick={onIncrement}>Increment</button>
      <button id="decrement" onClick={onDecrement}>Decrement</button>
      <button id="invalid" onClick={onInvalid}>Invalid</button>
    </div>
  );
};

/**
 * Start tests
 * */
beforeAll(() => {
  jest.useFakeTimers()
});

test("usePromiseReducer, success", async () => {
  const wrapper = mount(<App />);
  const button = wrapper.find('button#increment');
  await act(async () => {
    jest.runAllImmediates()
    button.simulate('click');
  })
  await act(async () => {
    jest.runAllImmediates()
    button.simulate('click');
  })
  await act(async () => {
    jest.runAllImmediates()
    button.simulate('click');
  })
  expect(increment).toHaveBeenNthCalledWith(1, 0);
  expect(onSuccess).toHaveBeenCalledWith(1);
});

test("usePromiseReducer, error", async () => {
  const wrapper = mount(<App />);
  const button = wrapper.find('button#decrement');
  await act(async () => {
    jest.runAllImmediates()
    button.simulate('click');
  })
  expect(onError).toHaveBeenCalledWith(decrementError);
});

test("usePromiseReducer, invalid action", async () => {
  const wrapper = mount(<App />);
  const button = wrapper.find('button#invalid');
  await act(async () => {
    jest.runAllImmediates()
    button.simulate('click');
  })
  expect(onError).toHaveBeenCalledWith(invalidError);
});
