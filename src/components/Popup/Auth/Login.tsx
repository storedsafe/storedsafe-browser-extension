import React, { Fragment, useState, useEffect } from 'react';
import StoredSafe, { StoredSafePromise } from 'storedsafe';
import { useStorage } from '../../../state/StorageState';
import {
  Form,
  FormValues,
  Input,
  RenderFunction,
  OnSubmitCallback,
} from '../../Form';
import { Message, Button } from '../../Layout';
import * as YubiKey from './YubiKey';
import * as TOTP from './TOTP';

interface LoginFormValues extends FormValues, YubiKey.FieldValues, TOTP.FieldValues {
  loginType: 'yubikey' | 'totp';
  remember: boolean;
  username: string;
}

interface LoginProps {
  url: string;
}

export const Login: React.FunctionComponent<LoginProps> = ({
  url,
}: LoginProps) => {
  const [state, dispatch] = useStorage();
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setErrors([]);
  }, []);

  const site = state.sites.list.find(({ url: siteUrl }) => siteUrl === url);

  const sitePrefs = state.sitePrefs[site.url] || {};
  const { username, loginType } = sitePrefs;

  const initialValues: LoginFormValues = {
    loginType: loginType || 'yubikey',
    username: username || '',
    remember: username !== undefined,
    keys: '',
    passphrase: '',
    otp: '',
  };

  const onSubmit: OnSubmitCallback = (values: LoginFormValues) => {
    const { loginType } = values;
    const storedSafe = new StoredSafe(site.url, site.apikey);
    let promise: StoredSafePromise;
    if (loginType === 'yubikey') {
      const { username, keys } = values;
      const passphrase = keys.slice(0, -44);
      const otp = keys.slice(-44);
      promise = storedSafe.authYubikey(username, passphrase, otp);
    } else if (loginType === 'totp') {
      const { username, passphrase, otp } = values;
      promise = storedSafe.authTotp(username, passphrase, otp);
    }

    setIsLoading(true);
    promise.then((response) => {
      if (response.status === 200) {
        const { remember, username } = values;
        dispatch({
          sessions: {
            type: 'add',
            url: site.url,
            session: {
              apikey: site.apikey,
              token: response.data.CALLINFO.token,
              createdAt: Date.now(),
            },
          },
          sitePrefs: {
            type: 'update',
            url: site.url,
            username: remember && username,
            loginType: loginType,
          },
        });
      } else {
        setErrors(response.data.ERRORS);
      }
    }).catch((error) => {
      if (error.response) {
        setErrors(error.response.data.ERRORS);
      } else if (error.request) {
        setErrors([`Network error: (${error.request.status}) ${error.request.statusText}`]);
      } else {
        setErrors(['Unexpected error.']);
        console.log('Login error: ', error.message);
      }
    }).then(() => setIsLoading(false));
  };

  const render: RenderFunction = (values: LoginFormValues, events) => (
    <Fragment>
      <label htmlFor="loginType">
        <span>Login Type</span>
        <Input.Select
          id="loginType"
          name="loginType"
          value={values.loginType}
          {...events}>
          <option value="yubikey">YubiKey</option>
          <option value="totp">TOTP</option>
        </Input.Select>
      </label>
      <label htmlFor="username">
        <span>Username</span>
        <input
          type="text"
          id="username"
          name="username"
          value={values.username}
          {...events}
        />
      </label>
      {values.loginType === 'yubikey' && YubiKey.renderFields(values, events)}
      {values.loginType === 'totp' && TOTP.renderFields(values, events)}
      <label htmlFor="remember" className="label-checkbox">
        <span>Remember Username</span>
        <Input.Checkbox
          id="remember"
          name="remember"
          checked={values.remember}
          {...events} />
      </label>
      <Button type="submit" isLoading={isLoading}>Login</Button>
    </Fragment>
  );

  return (
    <section className="login">
      <Form initialValues={initialValues} onSubmit={onSubmit} render={render} onFocus={(): void => setErrors([])} />
      {errors.length > 0 && (
        <Message type="error">{errors.map((error, index) => (<p key={index}>{error}</p>))}</Message>
    )}
    </section>
  );
};
