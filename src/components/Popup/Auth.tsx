import React, { useState } from 'react';
import { Site } from '../../model/Sites';
import { Sessions } from '../../model/Sessions';
import { SitePrefs } from '../../model/SitePrefs';
import * as Auth from '../Auth';

export interface LoginStatus {
  [url: string]: {
    loading: boolean;
    error: string;
  };
}

export interface AuthProps {
  sites: Site[];
  sessions: Sessions;
  sitePrefs: SitePrefs;
  onLogin: Auth.OnLoginCallback;
  onLogout: Auth.OnLogoutCallback;
  loginStatus: LoginStatus;
}

const PopupAuth: React.FunctionComponent<AuthProps> = ({
  sites,
  sessions,
  sitePrefs,
  onLogin,
  onLogout,
  loginStatus,
}: AuthProps) => {
  const lastUsed = sites.findIndex(({ url }) => sitePrefs.lastUsed === url);
  const [selected, setSelected] = useState<number>(lastUsed === -1 ? 0 : lastUsed);

  const left = <Auth.SiteList
    sites={sites}
    sessions={sessions}
    selected={selected}
    onSelect={setSelected}
  />;

  const url = sites[selected].url;
  const isOnline = sessions[url] !== undefined;

  const right = isOnline ? (
    (<Auth.SiteStatus
      url={url}
      session={sessions[url]}
      onLogout={onLogout}
    />)
  ) : (
    <Auth.Login
      key={url}
      site={sites[selected]}
      onLogin={onLogin}
      sitePrefs={sitePrefs.sites[url]}
      {...loginStatus[url]}
    />
  );

  return (
    <section className="auth content">
      <article>{left}</article>
      <article>{right}</article>
    </section>
  );
};

export default PopupAuth;
