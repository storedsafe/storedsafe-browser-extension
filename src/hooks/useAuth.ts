import { useState } from 'react';
import { Site } from '../model/Sites';
import { actions, LoginFields } from '../model/StoredSafe';

interface LoginStatus {
  [url: string]: {
    loading: boolean;
    error: string;
  };
}

interface AuthHook {
  login: (site: Site, fields: LoginFields) => void;
  logout: (url: string) => void;
  loginStatus: LoginStatus;
}

export const useAuth = (): AuthHook => {
  const [loginStatus, setLoginStatus] = useState<LoginStatus>({});

  const login = (site: Site, fields: LoginFields): void => {
    setLoginStatus((prevLoginStatus) => ({
      ...prevLoginStatus,
      [site.url]: { loading: true, error: undefined },
    }));
    actions.login(site, fields).then(() => {
      setLoginStatus((prevLoginStatus) => ({
        ...prevLoginStatus,
        [site.url]: { loading: false, error: undefined },
      }));
    }).catch((error) => {
      setLoginStatus((prevLoginStatus) => ({
        ...prevLoginStatus,
        [site.url]: { loading: false, error: error.message },
      }));
    });
  };

  const logout = (
    url: string,
  ): void => {
    actions.logout(url);
  };

  return {
    login,
    logout,
    loginStatus,
  };
};
