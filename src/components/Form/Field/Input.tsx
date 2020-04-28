import * as React from 'react';
import { FieldProps, FieldAttributes } from './Field';
import './Input.scss';

type InputProps = Pick<FieldProps, 'name' | 'type' | 'value' | 'onChange' | 'onBlur' | 'label'>;
export const Input: React.SFC<InputProps | FieldAttributes> = ({
  name,
  type,
  value,
  label,
  onChange,
  onBlur,
  ...attributes
}: InputProps) => (
  <div className={`field field-input field-input-${type}`}>
    <label htmlFor={name}>
      <span className="field-label">{label}</span>
      <div className="field-container">
        <input
          className="field-control"
          id={name}
          name={name}
          type={type}
          value={['number', 'range'].includes(type) && isNaN(value as number) ? '' : value as string | number}
          onChange={({ target }: React.ChangeEvent<HTMLInputElement>): void => {
            if (['number', 'range'].includes(type)) {
              onChange && onChange(target.valueAsNumber, name);
            } else {
              onChange && onChange(target.value, name);
            }
          }}
          onBlur={({ target }: React.FocusEvent<HTMLInputElement>): void => {
            if (['number', 'range'].includes(type)) {
              onBlur && onBlur(target.valueAsNumber, name);
            } else {
              onBlur && onBlur(target.value, name);
            }
          }}
          {...attributes}
        />
      </div>
    </label>
  </div>
);

Input.defaultProps = {
  type: 'text',
  value: '',
}
