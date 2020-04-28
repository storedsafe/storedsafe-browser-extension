import * as React from 'react';
import StoredSafe from 'storedsafe';
import { useStorage } from '../../../state/StorageState';
import { Logout } from './Logout';

interface LogoutContainerProps {
  url: string;
}

export const LogoutContainer: React.FC<LogoutContainerProps> = (props: LogoutContainerProps) => {
  const [state, dispatch] = useStorage();

  const onLogout = (): void => {
    const url = props.url;
    const { apikey, token } = state.sessions[url];
    const storedSafe = new StoredSafe(url, apikey, token);
    storedSafe.logout().then((res) => {
      if (res.status !== 200) {
        console.error(res.data.ERRORS);
      }
    }).catch((err) => {
      if (!err.isAxiosError) {
        console.error(`${err.response.status}: ${err.response.statusText}`);
      } else {
        console.error(err);
      }
    }).then(() => dispatch({ sessions: { type: 'remove', url } }));
  };

  return (
    <Logout onLogout={onLogout} />
  );
};
