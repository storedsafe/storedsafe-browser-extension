import * as React from 'react';
import { FieldProps, FieldAttributes } from './Field';
import './TextArea.scss';

type TextAreaProps = Pick<FieldProps, 'name' | 'value' | 'onChange' | 'onBlur' | 'label'>;
export const TextArea: React.SFC<TextAreaProps | FieldAttributes> = ({
  name,
  value,
  label,
  onChange,
  onBlur,
  ...attributes
}: TextAreaProps) => (
  <div className="field field-textarea">
    <label htmlFor={name}>
      <span className="form-label">{label}</span>
      <div className="field-container">
        <textarea
          className="field-control"
          id={name}
          name={name}
          value={value as string}
          onChange={({ target }: React.ChangeEvent<HTMLTextAreaElement>): void => {
            onChange && onChange(target.value, name);
          }}
          onBlur={({ target }: React.FocusEvent<HTMLTextAreaElement>): void => {
            onBlur && onBlur(target.value, name);
          }}
          {...attributes}
        />
      </div>
    </label>
  </div>
);
