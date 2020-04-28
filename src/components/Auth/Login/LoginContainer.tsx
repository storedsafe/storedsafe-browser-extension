import * as React from 'react';
import { Login, StoredSafeLoginCallback } from './Login';
import { LoadingSpinner } from '../../Layout';
import { useStorage } from '../../../state/StorageState';

interface LoginContainerProps {
  url: string;
}

export const LoginContainer: React.FC<LoginContainerProps> = (props: LoginContainerProps) => {
  const [errors, setErrors] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>();
  const [state, dispatch] = useStorage();

  const site = state.sites.list.find(({ url }) => url === props.url);
  const username = state.authState.usernames[props.url];

  const onLogin: StoredSafeLoginCallback = (promise, username) => {
    setIsLoading(true);
    promise.then((res) => {
      console.log(res, username);
      if (res.status === 200) {
        let authStateAction = {};
        const { apikey } = site;
        const { token } = res.data.CALLINFO;
        const sessionsAction = {
          sessions: {
            type: 'add' as 'add',
            url: props.url,
            session: {
              apikey,
              token,
              createdAt: Date.now(),
              lastActive: Date.now(),
            }
          }
        };
        if (username !== undefined) {
          authStateAction = {
            authState: {
              type: 'addUsername',
              url: props.url,
              username,
            }
          };
        }
        const actions = { ...sessionsAction, ...authStateAction };
        console.log(actions);
        dispatch(actions);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setErrors(res.data.ERRORS);
      }
    });
  };

  return (
    <React.Fragment>
      <Login site={site} errors={errors} onLogin={onLogin} username={username} />
      {isLoading && <LoadingSpinner />}
    </React.Fragment>
  );
};
