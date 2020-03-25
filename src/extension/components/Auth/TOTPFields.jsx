import React from 'react';

export default function TOTPFields() {
  return (
    <div className="fields">
      <label htmlFor="passphrase">
        <span>Passphrase</span>
        <input
          type="password"
          name="passphrase"
          id="passphrase"
          required
        />
      </label>
      <label htmlFor="otp">
        <span>TOTP</span>
        <input
          type="password"
          name="otp"
          id="otp"
          required
        />
      </label>
    </div>
  );
}
