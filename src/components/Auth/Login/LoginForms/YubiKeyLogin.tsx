import * as React from 'react';
import StoredSafe from 'storedsafe';
import { LoginForm, LoginFormProps } from '../Login';
import { YubiKeyLoginForm, YubiKeyFields } from './YubiKeyLoginForm';

export const YubiKeyLogin: LoginForm = ({
  onLogin,
  site,
  username,
}: LoginFormProps) => {
  const onSubmit = (values: YubiKeyFields): void => {
    const { url, apikey } = site;
    const storedSafe = new StoredSafe(url, apikey);
    const { username, keys, remember } = values;
    const passphrase = keys.slice(0, -44);
    const otp = keys.slice(-44);
    const promise = storedSafe.authYubikey(username, passphrase, otp);
    onLogin(promise, remember ? username : undefined);
  };

  return <YubiKeyLoginForm onSubmit={onSubmit} username={username} />
}
