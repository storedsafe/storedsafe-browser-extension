import React, { Fragment } from 'react';
import { FormHook } from '../../../hooks/useForm';

export interface FieldValues {
  passphrase: string;
  otp: string;
}

export const renderFields: (formHook: FormHook<FieldValues>) => React.ReactNode = ([values, events]) => (
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
