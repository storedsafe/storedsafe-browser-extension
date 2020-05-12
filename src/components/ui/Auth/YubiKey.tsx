import React, { Fragment } from 'react';
import { FormHook } from '../../../hooks/useForm';

export interface FieldValues {
  keys: string;
}

export const renderFields: (formHook: FormHook<FieldValues>) => React.ReactNode = ([values, events]) => (
  <Fragment>
    <label htmlFor="keys">
      <span>Passphrase + YubiKey</span>
      <input
        type="password"
        name="keys"
        id="keys"
        required
        title="Passphrase + YubiKey"
        value={values.keys}
        {...events}
      />
    </label>
  </Fragment>
)
