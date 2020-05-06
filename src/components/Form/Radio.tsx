import * as React from 'react';
import './Radio.scss';

type RadioProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

export const Radio: React.SFC<RadioProps> = (props: RadioProps) => (
  <React.Fragment>
    <div style={{ display: 'inline-block' }} className="radio">
      <input type="radio" {...props} />
      <div className="custom-radio" />
    </div>
  </React.Fragment>
);
