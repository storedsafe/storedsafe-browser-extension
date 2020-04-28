import * as React from 'react';
import { StoredSafePromise } from 'storedsafe';
import { Site } from '../../../model/Sites';
import { Message } from '../../Layout';
import LoginTypeSelector from './LoginTypeSelector';
import { YubiKeyLogin, TOTPLogin } from './LoginForms';

export type LoginType = 'yubikey' | 'totp';

export type StoredSafeLoginCallback = (
  promise: StoredSafePromise,
  username: string,
) => void;

export interface LoginFormProps {
  onLogin: StoredSafeLoginCallback;
  site: Site;
  username?: string;
}

export interface LoginForm extends React.FC<LoginFormProps> {}

export interface LoginProps extends LoginFormProps {
  errors: string[];
}

export const Login: React.FC<LoginProps> = ({
  errors,
  ...props
}: LoginProps) => {

  const loginTypes: {
    [key in LoginType]: {
      title: string;
      element: LoginForm;
    }
  } = {
    yubikey: {
      title: 'YubiKey',
      element: YubiKeyLogin,
    },
    totp: {
      title: 'TOTP',
      element: TOTPLogin,
    },
  };

  const options = Object.keys(loginTypes).map((key: LoginType) => ({
    title: loginTypes[key].title,
    value: key,
  }));

  return (
    <React.Fragment>
      <LoginTypeSelector
        loginTypes={options}
        render={((loginType: LoginType): React.ReactNode => (
        React.createElement(loginTypes[loginType].element, { ...props })
      ))} />
      {errors.length > 0 && errors.map((error, i) => <Message key={i} type="error">{error}</Message>)}
    </React.Fragment>
    );
};

Login.defaultProps = {
  username: '',
}
