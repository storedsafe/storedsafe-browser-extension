import * as React from 'react';
import { FieldProps, FieldAttributes } from './Field';
import './Radio.scss';

type RadioProps = Pick<FieldProps, 'name' | 'options' | 'value' | 'onChange' | 'onBlur' | 'labelDir' | 'label'>;
export const Radio: React.SFC<RadioProps | FieldAttributes> = ({
  name,
  value,
  label,
  labelDir,
  options,
  onChange,
  onBlur,
  ...attributes
}: RadioProps) => (
  <div className="field field-radio">
    <fieldset className="field-control">
      <legend className="field-label">{label}</legend>
      <div className="field-container">
        {options.map((option) => (
          <label key={option.value} htmlFor={`${name}-${option.value}`}>
            {labelDir === 'left' && option.title}
            <input
              id={`${name}-${option.value}`}
              name={name}
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={({ target }: React.ChangeEvent<HTMLInputElement>): void => {
                onChange && onChange(target.value, name);
              }}
              onBlur={({ target }: React.FocusEvent<HTMLInputElement>): void => {
                onBlur && onBlur(target.value, name);
              }}
              {...attributes}
            />
            <div className="custom-radio" />
            {labelDir === 'right' && option.title}
          </label>
        ))}
      </div>
    </fieldset>
  </div>
);

Radio.defaultProps = {
  options: [],
  labelDir: 'right',
};
