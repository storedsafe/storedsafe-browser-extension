import * as React from 'react';
import { useStorage } from '../../state/StorageState';
import SiteSelector from './SiteSelector';
import Login from './Login';
import Logout from './Logout';

export interface AuthProps {
  children?: React.ReactNode;
}
export const Auth: React.FC<AuthProps> = ({
  children,
}: AuthProps) => {
  const [state] = useStorage();

  const selected = state.authState.selected;
  const session = state.sessions[selected];

  if (state.isInitialized) {
    return (
      <React.Fragment>
        {Object.keys(state.sessions).length > 0 && children}
        {session !== undefined && <Login url={state.authState.selected} />}
        {session === undefined && <Logout url={state.authState.selected} />}
        <SiteSelector />
      </React.Fragment>
    );
  }
  return <p>Loading...</p>
}
