import React from 'react';
import { useForm, FormEventCallbacks } from '../../hooks/useForm';
import { Select, Checkbox, Message, Button } from '../common';
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
  sitePreferences?: SitePreferences;
  onLogin: OnLoginCallback;
  formEvents?: FormEventCallbacks;
}

export const Login: React.FunctionComponent<LoginProps> = ({
  site,
  error,
  loading,
  sitePreferences,
  onLogin,
  formEvents,
}: LoginProps) => {
  const { username, loginType } = sitePreferences && sitePreferences || {};
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

  const id = (name: string): string => site.host + '-' + name;

  return (
    <section className="login">
      <article className="login-form">
        <form className="form" onSubmit={handleSubmit}>
          <label htmlFor={id('loginType')}>
            <span>Login Type</span>
            <Select
              id={id('loginType')}
              name="loginType"
              value={values.loginType}
              {...events}>
              <option value="yubikey">YubiKey</option>
              <option value="totp">TOTP</option>
            </Select>
          </label>
          <label htmlFor={id('username')}>
            <span>Username</span>
            <input
              type="text"
              id={id('username')}
              name="username"
              value={values.username}
              required
              {...events}
            />
          </label>
          {values.loginType === 'yubikey' && YubiKey.renderFields([values, events, reset], id)}
          {values.loginType === 'totp' && TOTP.renderFields([values, events, reset], id)}
          <label htmlFor={id('remember')} className="label-checkbox">
            <span>Remember Username</span>
            <Checkbox
              id={id('remember')}
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
