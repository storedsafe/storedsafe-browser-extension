import * as React from 'react';

export type InputType = string | number | boolean;
export type OnChangeCallback = (value: InputType, name: string) => void;
export type OnBlurCallback = (value: InputType, name: string) => void;

export type FormValues = {
  [key: string]: InputType;
};

export type OnSubmitCallback = (values: FormValues) => void;
export type OnResetCallback = (values: FormValues, newValues: FormValues) => void;

interface FormHook {
  values: FormValues;
  onChange: OnChangeCallback;
  reset: () => void;
}

/**
 * Custom hook to handle interaction with the form fields
 * */
const useForm = (
  initialValues: FormValues,
  onChangeCB: OnChangeCallback,
  onResetCB: OnResetCallback,
): FormHook => {
  const [values, setValues] = React.useState<FormValues>(initialValues || {});
  const onChange: OnChangeCallback = (value, name) => {
    setValues({ ...values, [name]: value });
    onChangeCB && onChangeCB(value, name);
  };
  const reset = (): void => {
    setValues(initialValues);
    onResetCB && onResetCB(values, initialValues);
  }

  return { values, onChange, reset };
};

export interface FormProps {
  initialValues?: FormValues;
  handleChange?: OnChangeCallback;
  handleBlur?: OnBlurCallback;
  handleSubmit?: OnSubmitCallback;
  handleReset?: OnResetCallback;
  render?: (
    values: FormValues,
    onChange: OnChangeCallback,
    onBlur: OnBlurCallback,
  ) => React.ReactNode;
}

/**
 * Form wrapper for {Field} type fields.
 * The change and blur events are handled in the {Field} elements and
 * the {Form} element only expects the relevant values to be returned,
 * meaning this {Form} is incompatible with change and blur events of
 * regular input elements.
 * */
export const Form: React.FC<FormProps> = ({
  initialValues,
  handleChange,
  handleBlur,
  handleSubmit,
  handleReset,
  render,
}: FormProps) => {
  const { values, onChange, reset } = useForm(initialValues, handleChange, handleReset);

  const onSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();
    handleSubmit && handleSubmit(values);
  };

  const onReset = (
    event: React.FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();
    reset();
  };

  return (
    <form className="form" onSubmit={onSubmit} onReset={onReset}>
      {render && render(values, onChange, handleBlur)}
    </form>
  );
};
