import React from 'react';
import { useForm } from '../../../hooks/useForm';
import { Select, Checkbox, Message, Button } from '../common';
import * as YubiKey from './YubiKey';
import * as TOTP from './TOTP';
import './Login.scss';

interface LoginFormValues extends YubiKey.FieldValues, TOTP.FieldValues {
  loginType: 'yubikey' | 'totp';
  remember: boolean;
  username: string;
}

interface LoginProps {
  url: string;
  error?: string;
  loading?: boolean;
  sitePrefs?: {
    username?: string;
    loginType?: 'yubikey' | 'totp';
  };
  onSubmit: (values: LoginFormValues) => void;
}

export const Login: React.FunctionComponent<LoginProps> = ({
  url,
  error,
  loading,
  sitePrefs,
  onSubmit,
}: LoginProps) => {
  const { username, loginType } = sitePrefs && sitePrefs || {};
  const initialValues: LoginFormValues = {
    loginType: loginType || 'yubikey',
    username: username || '',
    remember: username !== undefined,
    keys: '',
    passphrase: '',
    otp: '',
  };
  const [values, events, reset] = useForm(initialValues);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <section className="login">
      <h2>{url}</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label htmlFor="loginType">
          <span>Login Type</span>
          <Select
            id="loginType"
            name="loginType"
            value={values.loginType}
            {...events}>
            <option value="yubikey">YubiKey</option>
            <option value="totp">TOTP</option>
          </Select>
        </label>
        <label htmlFor="username">
          <span>Username</span>
          <input
            type="text"
            id="username"
            name="username"
            value={values.username}
            required
            {...events}
          />
        </label>
        {values.loginType === 'yubikey' && YubiKey.renderFields([values, events, reset])}
        {values.loginType === 'totp' && TOTP.renderFields([values, events, reset])}
        <label htmlFor="remember" className="label-checkbox">
          <span>Remember Username</span>
          <Checkbox
            id="remember"
            name="remember"
            checked={values.remember}
            {...events} />
        </label>
        <Button type="submit" color="accent" isLoading={loading}>Login</Button>
        {error && (
          <Message type="error">{error}</Message>
        )}
      </form>
    </section>
  );
};
