import React from 'react';

export default function AuthForm(props) {
  return (
    <section className="login">
      <select>
        <option>YubiKey</option>
        <option>TOTP</option>
      </select>
      <form>
        <label htmlFor="username">Username or e-mail</label>
        <input
          type="text"
          name="username"
          id="username"
        />
        <ul className="login-type">
          <li key="yubikey">
            <label htmlFor="passphrase">Passphrase + YubiKey</label>
            <input
              type="password"
              name="passphrase"
              id="passphrase"
            />
          </li>
          <li key="totp">
            <label htmlFor="passphrase">Passphrase</label>
            <input
              type="password"
              name="passphrase"
              id="passphrase"
            />
            <label htmlFor="otp">OTP</label>
            <input
              type="text"
              name="OTP"
              id="OTP"
            />
          </li>
        </ul>
        <label htmlFor="rememberUsername">
          <input
            type="checkbox"
            name="rememberUsername"
            id="rememberUsername"
          />
          Remember Username
        </label>
        <input type="submit" value="Login to StoredSafe" />
      </form>
      <button>Logout from StoredSafe</button>
    </section>
  );
}
