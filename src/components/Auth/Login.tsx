import React from 'react';
import { Site } from '../../model/Sites';
import { useForm, FormEventCallbacks } from '../../hooks/useForm';
import { Select, Checkbox, Message, Button } from '../common';
import { LoginFields, LoginType } from '../../model/StoredSafe';
import * as YubiKey from './YubiKey';
import * as TOTP from './TOTP';
import './Login.scss';

type LoginFormValues = { remember: boolean } & LoginFields;

export type OnLoginCallback = (
  site: Site,
  values: LoginFormValues,
) => void;

interface LoginProps {
  site: Site;
  error?: string;
  loading?: boolean;
  sitePrefs?: {
    username?: string;
    loginType?: LoginType;
  };
  onLogin: OnLoginCallback;
  formEvents?: FormEventCallbacks;
}

export const Login: React.FunctionComponent<LoginProps> = ({
  site,
  error,
  loading,
  sitePrefs,
  onLogin,
  formEvents,
}: LoginProps) => {
  const { url } = site;
  const { username, loginType } = sitePrefs && sitePrefs || {};
  const initialValues: LoginFormValues = {
    loginType: loginType || 'totp', // Set default to TOTP
    username: username || '',
    remember: username !== undefined,
    keys: '',
    passphrase: '',
    otp: '',
  };
  const [values, events, reset] = useForm(initialValues, formEvents);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onLogin(site, values);
  };

  return (
    <section className="login">
      <article className="login-form">
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
        </form>
      </article>
      {error && (
        <Message type="error">
          {error}
        </Message>
      )}
    </section>
  );
};
