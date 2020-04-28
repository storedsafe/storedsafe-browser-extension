import * as React from 'react';
import { OnChangeCallback, OnBlurCallback, InputType } from '../Form';
import { Input } from './Input';
import { Checkbox } from './Checkbox';
import { Select } from './Select';
import { TextArea } from './TextArea';
import { Radio } from './Radio';
import { Button } from './Button';
import './Field.scss';

export type FieldAttributes =
  Omit<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'name' | 'name' | 'type' | 'value' | 'checked' | 'onChange' | 'onBlur'>
| Omit<React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>, 'name' | 'name' | 'value' | 'onChange' | 'onBlur'>
| Omit<React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>, 'name' | 'name' | 'value' | 'onChange' | 'onBlur'>;

export interface Option {
  title: string;
  value: string | number;
}

export interface FieldProps {
  name: string;
  label: string;
  type?: string;
  labelDir?: 'left' | 'right';
  options?: Option[];
  value?: InputType;
  onChange?: OnChangeCallback;
  onBlur?: OnBlurCallback;
}

export const Field: React.SFC<FieldProps | FieldAttributes> = ({
  type,
  ...attributes
}: FieldProps) => {
  if (type === 'select') {
    return <Select
      {...attributes}
    />;
  }
  if (type === 'textarea') {
    return <TextArea
      {...attributes}
    />
  }
  if (type === 'checkbox') {
    return <Checkbox
      {...attributes}
    />
  }
  if (type === 'radio') {
    return <Radio
      {...attributes}
    />
  }
  if (['button', 'submit', 'reset'].includes(type)) {
    return <Button
      type={type}
      {...attributes}
    />
  }

  return <Input
    type={type}
    {...attributes}
  />;
};

Field.defaultProps = {
  type: 'text',
}
