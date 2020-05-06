import * as React from 'react';

type FormFieldElement = (
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
);
export type InputType = string | number | boolean | string[];
export type OnChangeCallback = (value: InputType, name: string) => void;
export type OnBlurCallback = (value: InputType, name: string) => void;

export interface FormValues {
  [key: string]: InputType;
}

export type OnSubmitCallback<T extends FormValues = FormValues> = (
  values: T,
  reset: () => void,
) => void;
export type OnResetCallback<T extends FormValues = FormValues> = (values: T, newValues: T) => void;
export type RenderFunction<T extends FormValues = FormValues> = (
  values: T,
  events: {
    onChange: (event: React.ChangeEvent<FormFieldElement>) => void;
    onBlur: (event: React.FocusEvent<FormFieldElement>) => void;
  }
) => React.ReactNode;

interface FormHook {
  values: FormValues;
  onChange: (event: React.ChangeEvent<FormFieldElement>) => void;
  onBlur: (event: React.FocusEvent<FormFieldElement>) => void;
  reset: () => void;
}

/**
 * Custom hook to handle interaction with the form fields
 * */
const useForm = (
  initialValues: FormValues,
  onChangeCB: OnChangeCallback,
  onBlurCB: OnBlurCallback,
  onResetCB: OnResetCallback<FormValues>,
): FormHook => {
  const [values, setValues] = React.useState<FormValues>(initialValues);
  const onFieldEvent = (
    target: FormFieldElement
  ): { value: InputType; name: string } => {
    const { name } = target;
    let value;
    if (target instanceof HTMLInputElement) {
      if (target.type === 'checkbox') {
        value = target.checked;
      } else if (['number', 'range'].includes(target.type)) {
        value = target.valueAsNumber;
      } else {
        value = target.value;
      }
    } else {
      value = target.value;
    }
    setValues({ ...values, [name]: value });
    return { value, name };
  }

  const onChange = ({
    target
  }: React.ChangeEvent<FormFieldElement>): void => {
    const { value, name } = onFieldEvent(target);
    onChangeCB && onChangeCB(value, name);
  };

  const onBlur = ({
    target
  }: React.FocusEvent<FormFieldElement>): void => {
    const { value, name } = onFieldEvent(target);
    onBlurCB && onBlurCB(value, name);
  };

  const reset = (): void => {
    setValues(initialValues);
    onResetCB && onResetCB(values, initialValues);
  }

  return { values, onChange, onBlur, reset };
};

export interface CustomFormProps {
  initialValues?: FormValues;
  onChange?: OnChangeCallback;
  onBlur?: OnBlurCallback;
  onSubmit?: OnSubmitCallback<FormValues>;
  onReset?: OnResetCallback<FormValues>;
  render?: RenderFunction<FormValues>;
  className?: string;
}

type FormElementProps = Omit<React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>, 'onSubmit' | 'onReset' | 'onChange' | 'onBlur' | 'className'>;

type FormProps = FormElementProps & CustomFormProps;

/**
 * Wraps state of form and does pre-processing on field
 * events to avoid boilerplate event handling.
 * */
export const Form: React.FunctionComponent<FormProps> = ({
  initialValues,
  onChange: changeCB,
  onBlur: blurCB,
  onSubmit: submitCB,
  onReset: resetCB,
  render,
  className,
  ...props
}: FormProps) => {
  const {
    values,
    onChange,
    onBlur,
    reset,
  } = useForm(
    initialValues,
    changeCB,
    blurCB,
    resetCB
  );

  const onSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();
    submitCB && submitCB(values, reset);
  };

  const onReset = (
    event: React.FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();
    reset();
  };

  return (
    <form
      className={`form${className !== undefined ? ' ' + className : ''}`}
      onSubmit={onSubmit}
      onReset={onReset}
      {...props} >
      {render && render(values, { onChange, onBlur })}
    </form>
  );
};
