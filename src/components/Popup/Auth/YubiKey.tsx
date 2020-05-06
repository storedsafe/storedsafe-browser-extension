import React, { Fragment } from 'react';
import { RenderFunction, FormValues } from '../../Form';

export interface FieldValues extends FormValues {
  keys: string;
}

export const renderFields: RenderFunction = (values: FieldValues, events) => (
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
