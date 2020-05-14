import React, { Fragment } from 'react';
import { FormHook } from '../../../hooks/useForm';
import { YubiKeyFields } from '../../../model/StoredSafe';

export const renderFields: (formHook: FormHook<YubiKeyFields>) => React.ReactNode = ([values, events]) => (
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
