import React, { useState } from 'react';
import StoredSafe from 'storedsafe';
import { useStorage } from '../../../state/StorageState';
import { Button } from '../../Layout';

interface LogoutProps {
  url: string;
}

export const Logout: React.FunctionComponent<LogoutProps> = ({
  url,
}: LogoutProps) => {
  const [state, dispatch] = useStorage();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const session = state.sessions[url];

  const logout = (): void => {
    setIsLoading(true);
    const { apikey, token } = session;
    const storedSafe = new StoredSafe(url, apikey, token);
    storedSafe.logout().then((response) => {
      if (response.status !== 200) {
        console.log('Logout error: ', response.data.ERRORS);
      }
    }).catch((error) => {
      if (error.response) {
        console.log('Logout error: ', error.response.data.ERRORS);
      } else if (error.request) {
        console.log('Logout error: ', error.request.status, error.request.statusText);
      } else {
        console.log('Logout error: ', error.message);
      }
    }).then(() => {
      setIsLoading(false);
      dispatch({
        sessions: {
          type: 'remove',
          url,
        },
      });
    });
  };

  return (
    <section className="logout">
      <Button type="button" onClick={logout} color="danger" isLoading={isLoading}>Logout</Button>
    </section>
  );
}
