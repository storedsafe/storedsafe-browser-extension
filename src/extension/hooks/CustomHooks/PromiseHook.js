import { useState } from 'react';

const usePromise = (initialValue = null) => {
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const resolve = (promise) => {
    setIsLoading(true);
    setError(null);
    promise.then((val) => {
      setIsLoading(false);
      setValue(val);
    }).catch((err) => {
      setIsLoading(false);
      setError(err);
    });
  };

  return {
    value,
    resolve,
    isLoading,
    error,
  };
};

export default usePromise;
