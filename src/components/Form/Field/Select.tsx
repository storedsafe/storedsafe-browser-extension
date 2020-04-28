import * as React from 'react';
import { FieldProps, FieldAttributes } from './Field';
import './Select.scss';

type SelectProps = Pick<FieldProps, 'name' | 'options' | 'value' | 'onChange' | 'onBlur' | 'label'>;
export const Select: React.SFC<SelectProps | FieldAttributes> = ({
  name,
  options,
  value,
  label,
  onChange,
  onBlur,
  ...attributes
}: SelectProps) => (
  <div className="field field-select">
    <label htmlFor={name}>
      <span className="field-label">{label}</span>
      <div className="field-container">
        <div className="custom-select">
          <select
            className="field-control"
            id={name}
            name={name}
            value={value as string | number}
            onChange={({ target }: React.ChangeEvent<HTMLSelectElement>): void => {
              onChange && onChange(target.value, name);
            }}
            onBlur={({ target }: React.FocusEvent<HTMLSelectElement>): void => {
              onBlur && onBlur(target.value, name);
            }}
            {...attributes}>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.title}
              </option>
            ))}
          </select>
        </div>
      </div>
    </label>
  </div>
);

Select.defaultProps = {
  options: [],
};
