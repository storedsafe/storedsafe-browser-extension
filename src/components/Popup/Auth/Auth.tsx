import React from 'react';
import { useStorage } from '../../../state/StorageState';
import { Login } from './Login';
import { Logout } from './Logout';
import './Auth.scss';

interface AuthProps {
  url: string;
}

export const Auth: React.FunctionComponent<AuthProps> = ({
  url,
}: AuthProps) => {
  const [state] = useStorage();
  const isOnline = state.sessions[url] !== undefined;

  if (isOnline) {
    return <Logout url={url} />;
  } else {
    return <Login url={url} />;
  }
};
