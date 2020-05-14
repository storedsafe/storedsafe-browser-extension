import { useState } from 'react';

type InputElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
type InputType = any; // eslint-disable-line @typescript-eslint/no-explicit-any
type InputEventCallback = (value: InputType, name: string) => void;

export interface FormEventCallbacks {
  onChange?: InputEventCallback;
  onBlur?: InputEventCallback;
  onFocus?: InputEventCallback;
}

interface FormEvents {
  onChange: (event: React.ChangeEvent<InputElement>) => void;
  onBlur: (event: React.FocusEvent<InputElement>) => void;
  onFocus: (event: React.FocusEvent<InputElement>) => void;
}

export type FormHook<Values> = [
  Values,
  FormEvents,
  (values?: Values) => void,
];

/**
 * Handle form state and input events.
 * @param {initialValues} Initial state of the form.
 * */
export const useForm = <Values>(
  initialValues: Values,
  events?: FormEventCallbacks,
): FormHook<Values> => {
  const [values, setValues] = useState<Values>(initialValues);

  const parseElement = (
    element: InputElement
  ): [string | number | string[] | boolean, string] => {
    // Select Element
    if (element instanceof HTMLSelectElement) {

      //// Select Multiple
      if (element.multiple) {
        const values = [];
        const options = element.children;
        for (let i = 0; i < options.length; i++) {
          const option = options.item(i);
          if (option instanceof HTMLOptionElement) {
            const { value, selected } = option;
            if(selected) {
              values.push(value);
            }
          }
        }
        return [values, element.name];
      }

      //// Select Single
      return [element.value, element.name];
    }

    // Textarea Element
    if (element instanceof HTMLTextAreaElement) {
      return [element.value, element.name];
    }

    // Input Element
    if (element instanceof HTMLInputElement) {

      //// Input Checkbox
      if (element.type === 'checkbox') {
        return [element.checked, element.name];
      }

      //// Input Number
      if (element.type === 'number' || element.type === 'range') {
        if (!isNaN(element.valueAsNumber)) {
          return [element.valueAsNumber, element.name];
        }
      }

      // Other Inputs
      return [element.value, element.name];
    }
  };

  /**
   * Update form state when an input changes, call onChange callback.
   * */
  const onChange = ({ target }: React.ChangeEvent<InputElement>): void => {
    const [value, name] = parseElement(target);
    setValues({ ...values, [name]: value });
    events && events.onChange && events.onChange(value, name);
  };

  /**
   * Call onBlur callback on focus out.
   * */
  const onBlur = ({ target }: React.FocusEvent<InputElement>): void => {
    const [value, name] = parseElement(target);
    events && events.onBlur && events.onBlur(value, name);
  };

  /**
   * Call onFocus callback on focus in.
   * */
  const onFocus = ({ target }: React.FocusEvent<InputElement>): void => {
    const [value, name] = parseElement(target);
    events && events.onFocus && events.onFocus(value, name);
  };

  /**
   * Reset form with initial values or provided values.
   * */
  const reset = (values = initialValues): void => {
    setValues(values);
  };

  return [values, { onChange, onBlur, onFocus }, reset];
};
