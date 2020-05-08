import * as React from 'react';
import './Checkbox.scss';

type CheckboxProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
export const Checkbox: React.SFC<CheckboxProps> = (props: CheckboxProps) => (
  <React.Fragment>
    <div style={{ display: 'inline-block' }} className="checkbox">
      <input type="checkbox" {...props} />
      <div className="custom-checkbox" />
    </div>
  </React.Fragment>
);
