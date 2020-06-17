import React, { Fragment } from 'react';
import { FormHook } from '../../hooks/useForm';

export const renderFields: (formHook: FormHook<TOTPFields>, id: (name: string) => string) => React.ReactNode = ([values, events], id) => (
  <Fragment>
    <label htmlFor="passphrase">
      <span>Passphrase</span>
      <input
        type="password"
        name="passphrase"
        id={id('passphrase')}
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
        id={id('otp')}
        required
        value={values.otp}
        {...events}
      />
    </label>
  </Fragment>
)
