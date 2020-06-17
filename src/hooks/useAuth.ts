import { useState } from 'react';
import { OnLoginCallback, OnLogoutCallback } from '../components/Auth';
import { LoginStatus } from '../components/Popup';
import { useStorage } from './useStorage';

interface AuthHook {
  onLogin: OnLoginCallback;
  onLogout: OnLogoutCallback;
  loginStatus: LoginStatus;
}

export const useAuth = (): AuthHook => {
  const { dispatch } = useStorage();
  const [loginStatus, setLoginStatus] = useState<LoginStatus>({});

  const onLogin: OnLoginCallback = (site, fields) => {
    setLoginStatus((prevLoginStatus) => ({
      ...prevLoginStatus,
      [site.host]: { loading: true, error: undefined },
    }));
    dispatch({
      preferences: {
        type: 'update',
        host: site.host,
        sitePreferences: {
          username: fields.remember ? fields.username : undefined,
          loginType: fields.loginType,
        },
      },
      sessions: {
        type: 'login',
        site,
        fields,
      },
    }, {
      onSuccess: () => {
        setLoginStatus((prevLoginStatus) => ({
          ...prevLoginStatus,
          [site.host]: { loading: false, error: undefined },
        }));
      },
      onError: (error) => {
        setLoginStatus((prevLoginStatus) => ({
          ...prevLoginStatus,
          [site.host]: { loading: false, error: error.message },
        }));
      },
    });
  };

  const onLogout: OnLogoutCallback = (host: string) => {
    dispatch({
      sessions: {
        type: 'logout',
        host,
      },
    })
  };

  return {
    onLogin,
    onLogout,
    loginStatus,
  };
};
