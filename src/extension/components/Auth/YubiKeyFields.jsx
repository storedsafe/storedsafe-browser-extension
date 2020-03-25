import React from 'react';

export default function YubiKeyFields() {
  return (
    <div>
      <label htmlFor="keys">
        <span>Passphrase + YubiKey</span>
        <input
          type="password"
          name="keys"
          id="keys"
          minLength="44"
          required
        />
      </label>
    </div>
  );
}
