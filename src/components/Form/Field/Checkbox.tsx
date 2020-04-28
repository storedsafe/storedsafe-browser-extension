import * as React from 'react';
import { FieldProps, FieldAttributes } from './Field';
import './Checkbox.scss';

type CheckboxProps = Pick<FieldProps, 'name' | 'value' | 'onChange' | 'onBlur' | 'label' | 'labelDir'>
export const Checkbox: React.SFC<CheckboxProps | FieldAttributes> = ({
  name,
  value,
  label,
  labelDir,
  onChange,
  onBlur,
  ...attributes
}: CheckboxProps) => (
  <div className="field field-checkbox">
    <div className="field-container">
      <label htmlFor={name} className="field-label">
        {labelDir === 'left' && (<span className="field-label">{label}</span>)}
        <input
          id={name}
          name={name}
          type="checkbox"
          checked={value as boolean}
          onChange={({ target }: React.ChangeEvent<HTMLInputElement>): void => {
            onChange && onChange(target.checked, target.name);
          }}
          onBlur={({ target }: React.FocusEvent<HTMLInputElement>): void => {
            onBlur && onBlur(target.checked, target.name);
          }}
          {...attributes}
        />
        <div className="custom-checkbox" />
        {labelDir === 'right' && (<span className="field-label">{label}</span>)}
      </label>
    </div>
  </div>
);

Checkbox.defaultProps = {
  value: false,
  labelDir: 'right',
};
