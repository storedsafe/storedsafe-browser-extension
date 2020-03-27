import { useState } from 'react';

const useForm = () => {
  const [inputs, setInputs] = useState({});

  const onChange = ({ target }) => {
    const { name, type } = target;
    const value = ['checkbox'].includes(type)
      ? target.checked
      : target.value;
    setInputs({ ...inputs, [name]: value });
  };

  return {
    inputs,
    onChange,
  };
};

export default useForm;
