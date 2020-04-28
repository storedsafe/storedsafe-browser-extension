import * as React from 'react';
import StoredSafe from 'storedsafe';
import { LoginForm, LoginFormProps } from '../Login';
import { TOTPLoginForm, TOTPFields } from './TOTPLoginForm';

export const TOTPLogin: LoginForm = ({
  onLogin,
  site,
  username,
}: LoginFormProps) => {
  const onSubmit = (values: TOTPFields): void => {
    const { url, apikey } = site;
    const storedSafe = new StoredSafe(url, apikey);
    const { username, passphrase, otp, remember } = values;
    const promise = storedSafe.authTotp(username, passphrase, otp);
    onLogin(promise, remember ? username : undefined);
  };

  return <TOTPLoginForm onSubmit={onSubmit} username={username} />
};
