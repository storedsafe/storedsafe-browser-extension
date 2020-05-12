import React, { Fragment } from 'react';
import { RenderFunction, FormValues } from '../../Form';

export interface FieldValues extends FormValues {
  passphrase: string;
  otp: string;
}

export const renderFields: RenderFunction = (values: FieldValues, events) => (
  <Fragment>
    <label htmlFor="passphrase">
      <span>Passphrase</span>
      <input
        type="password"
        name="passphrase"
        id="passphrase"
        required
        value={values.passphrase}
        {...events}
      />
    </label>
    <label htmlFor="otp">
      <span>OTP</span>
      <input
        type="text"
        name="otp"
        id="otp"
        required
        value={values.otp}
        {...events}
      />
    </label>
  </Fragment>
)
