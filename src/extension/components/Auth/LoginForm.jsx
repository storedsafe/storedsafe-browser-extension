import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Input, { useForm } from '../Input';

/**
 * Enum containing the available login types.
 * */
const LoginType = Object.freeze({
  YUBIKEY: 'yubikey',
  TOTP: 'totp',
});

const LoginTypeData = Object.freeze({
  [LoginType.YUBIKEY]: {
    title: 'YubiKey',
    value: 'yubikey',
    fields: (inputs, onChange) => [
      <Input
        key="keys"
        type="password"
        name="keys"
        title="Passphrase + YubiKey"
        value={inputs.keys || ''}
        onChange={onChange}
        pattern=".+.{44}"
        required
      />,
    ],
    onSubmit: ({ keys }) => ({
      passphrase: keys.slice(0, -44),
      otp: keys.slice(-44),
    }),
  },
  [LoginType.TOTP]: {
    title: 'TOTP',
    value: 'totp',
    fields: (inputs, onChange) => [
      <Input
        key="passphrase"
        type="password"
        name="passphrase"
        title="Passphrase"
        value={inputs.passphrase || ''}
        onChange={onChange}
        required
      />,
      <Input
        key="otp"
        type="password"
        name="otp"
        title="TOTP"
        value={inputs.otp || ''}
        onChange={onChange}
        required
      />,
    ],
    onSubmit: ({ passphrase, otp }) => ({
      passphrase,
      otp,
    }),
  },
});

function LoginForm({
  defaultLoginType,
  onLogin,
}) {
  const [loginType, setLoginType] = useState(defaultLoginType);
  const { inputs, onChange } = useForm();

  // Change password fields when login type changes
  const onLoginTypeChange = (event) => {
    setLoginType(event.target.value);
  };

  // Create login type options from enum
  const loginOptions = Object.values(LoginType).map((key) => (
    <option key={key} value={LoginTypeData[key].value}>
      {LoginTypeData[key].title}
    </option>
  ));

  const onSubmit = (event) => {
    event.preventDefault();
    const { remember, username } = inputs;
    onLogin(loginType, remember, {
      username,
      ...LoginTypeData[loginType].onSubmit(inputs),
    });
  };

  return (
    <form className="login" onSubmit={onSubmit}>
      <Input
        type="select"
        name="logintype"
        title="Login Type"
        onChange={onLoginTypeChange}
      >
        {loginOptions}
      </Input>
      <Input
        type="text"
        name="username"
        title="Username or e-mail"
        value={inputs.username || ''}
        onChange={onChange}
        required
      />
      {/* Password fields depending on login type */}
      {LoginTypeData[loginType].fields(inputs, onChange)}
      <Input
        type="checkbox"
        name="remember"
        title="Remember Username"
        checked={inputs.remember || false}
        onChange={onChange}
      />
      <Input
        type="submit"
        name="submit"
        title="Login to StoredSafe"
      />
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

export { LoginType };
export default LoginForm;
