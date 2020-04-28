import * as React from 'react';
import { FieldProps, FieldAttributes } from './Field';
import './Button.scss';

type ButtonProps = Pick<FieldProps, 'name' | 'type' | 'value' | 'onBlur' | 'label'>;
export const Button: React.SFC<ButtonProps | FieldAttributes> = ({
  name,
  type,
  label,
  value,
  onBlur,
  ...attributes
}: ButtonProps) => (
  <div className="field field-button">
    <button
      className="field-container field-control"
      id={name}
      name={name}
      defaultValue={value as string}
      type={type as 'button' | 'submit' | 'reset'}
      onBlur={(): void => {
        onBlur && onBlur(value, name);
      }}
      {...attributes}>
      {label}
    </button>
  </div>
);
