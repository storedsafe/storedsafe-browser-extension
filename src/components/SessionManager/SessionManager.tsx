import React, { useState, useEffect } from 'react';
import { useStorage } from '../../state/StorageState';
import { Collapsible, OnlineIndicator } from '../Layout';
import { Field } from '../Form';
import Login from '../Auth/Login';
import Logout from '../Auth/Logout';
import './SessionManager.scss';

export const SessionManager: React.FC = () => {
  const [state] = useStorage();
  const [selected, setSelected] = useState<string>();

  useEffect(() => {
    setSelected(undefined);
  }, [state]);

  return (
    <React.Fragment>
      {state.isInitialized && (
        state.sites.list.map((site) => {
          const isOnline = Object.keys(state.sessions).includes(site.url);
          const isSelected = selected === site.url;
          return (
            <Collapsible key={site.url} collapsed={selected && !isSelected}>
              <div className="session-manager-site" onClick={(): void => !isOnline && setSelected(isSelected ? undefined : site.url)}>
                <p>{site.url}</p>
                <div className="session-manager-icons">
                  {isOnline && <Logout url={site.url} />}
                  <OnlineIndicator online={isOnline} />
                </div>
              </div>
              <Collapsible collapsed={!isSelected}>
                <Login url={site.url} />
              </Collapsible>
            </Collapsible>
          );
        })
      )}
    </React.Fragment>
  );
};
