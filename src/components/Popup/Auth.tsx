import React from 'react';
import { ListView } from '../common';
import * as Auth from '../Auth';
import './Auth.scss';

export interface LoginStatus {
  [host: string]: {
    loading: boolean;
    error: string;
  };
}

export interface AuthProps {
  sites: Site[];
  sessions: Sessions;
  preferences: Preferences;
  onLogin: Auth.OnLoginCallback;
  onLogout: Auth.OnLogoutCallback;
  loginStatus: LoginStatus;
}

const PopupAuth: React.FunctionComponent<AuthProps> = ({
  sites,
  sessions,
  preferences,
  onLogin,
  onLogout,
  loginStatus,
}: AuthProps) => {
  if (sites.length === 0) {
    return (
      <section className="popup-auth">
        <p>No sites available, go to options to add a new site.</p>
      </section>
    );
  }

  const items = sites.map((site) => {
    const { host } = site;
    const session = sessions.get(host);
    const isOnline = session !== undefined;

    const title = <Auth.SiteTitle
      host={host}
      session={session}
    />;

    let content
    if (isOnline) {
      content = (
        <Auth.SiteStatus
          host={host}
          session={session}
          onLogout={onLogout}>
        </Auth.SiteStatus>
      );
    } else {
      content = (
        <Auth.Login
          site={site}
          onLogin={onLogin}
          sitePreferences={preferences.sites[host]}
          {...loginStatus[host]}>
        </Auth.Login>
      );
    }

    return {
      key: host,
      title,
      content,
    };
  });

  const defaultSelected = sites.length === 1 ? sites[0].host : sessions.size <= 1 ? preferences.lastUsedSite : undefined;

  return (
    <section className="popup-auth">
      <ListView items={items} defaultSelected={defaultSelected} />
    </section>
  );
};

export default PopupAuth;
