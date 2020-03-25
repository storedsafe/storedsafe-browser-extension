import React, { useState } from 'react';
import PropTypes from 'prop-types';
import YubiKeyFields from './YubiKeyFields';
import TOTPFields from './TOTPFields';

const LoginType = Object.freeze({
  YUBIKEY: 'yubikey',
  TOTP: 'totp',
});

const LoginTypeData = Object.freeze({
  [LoginType.YUBIKEY]: {
    title: 'YubiKey',
    value: 'yubikey',
  },
  [LoginType.TOTP]: {
    title: 'TOTP',
    value: 'totp',
  },
});

function LoginForm({
  defaultLoginType,
  onLogin,
}) {
  const [loginType, setLoginType] = useState(defaultLoginType);

  // Assign selected password fields
  let passwordFields;
  switch (loginType) {
    case LoginType.YUBIKEY:
      passwordFields = <YubiKeyFields />;
      break;
    case LoginType.TOTP:
      passwordFields = <TOTPFields />;
      break;
    default:
      break;
  }

  // Change password fields when login type changes
  const onLoginTypeChange = (event) => {
    setLoginType(event.target.value);
  };

  // Parse form before lifting state
  const onSubmit = (event) => {
    event.preventDefault();

    const remember = event.target.remember.checked;
    const username = event.target.username.value;

    switch (loginType) {
      case LoginType.YUBIKEY: {
        const keys = event.target.keys.value;
        onLogin(loginType, remember, {
          username,
          passphrase: keys.slice(0, -44),
          otp: keys.slice(-44),
        });
        break;
      }
      case LoginType.TOTP: {
        onLogin(loginType, remember, {
          username,
          passphrase: event.target.passphrase.value,
          otp: event.target.otp.value,
        });
        break;
      }
      default:
        break;
    }
  };

  // Create login type options from enum
  const loginOptions = Object.values(LoginType).map((key) => (
    <option key={key} value={LoginTypeData[key].value}>
      {LoginTypeData[key].title}
    </option>
  ));

  const loginTypeID = 'logintype';
  return (
    <form className="login" onSubmit={onSubmit}>
      <label htmlFor={loginTypeID}>
        <span>Login Type</span>
        <div className="select">
          <select
            name={loginTypeID}
            id={loginTypeID}
            value={loginType}
            onChange={onLoginTypeChange}
          >
            {loginOptions}
          </select>
        </div>
      </label>
      <label htmlFor="username">
        <span>Username or e-mail</span>
        <input
          type="text"
          name="username"
          id="username"
          required
        />
      </label>
      {passwordFields}
      <label className="checkbox-container" htmlFor="remember">
        <span>Remember Username</span>
        <input
          type="checkbox"
          name="remember"
          id="remember"
        />
        <span className="checkmark" />
      </label>
      <input type="submit" value="Login to StoredSafe" />
    </form>
  );
}

LoginForm.defaultProps = {
  defaultLoginType: LoginType.YUBIKEY,
};

LoginForm.propTypes = {
  defaultLoginType: PropTypes.string,
  onLogin: PropTypes.func.isRequired,
};

export default LoginForm;
