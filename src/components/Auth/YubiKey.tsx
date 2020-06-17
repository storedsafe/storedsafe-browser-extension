import React, { Fragment } from 'react';
import { FormHook } from '../../hooks/useForm';

export const renderFields: (formHook: FormHook<YubiKeyFields>, id: (name: string) => string) => React.ReactNode = ([values, events], id) => (
  <Fragment>
    <label htmlFor="keys">
      <span>Passphrase + YubiKey</span>
      <input
        type="password"
        name="keys"
        id={id('password')}
        required
        title="Passphrase + YubiKey"
        value={values.keys}
        {...events}
      />
    </label>
  </Fragment>
)
