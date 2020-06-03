import React from 'react';
import { Site } from '../../model/Sites';
import { Sessions } from '../../model/Sessions';
import { SitePrefs } from '../../model/SitePrefs';
import { ListView } from '../common';
import * as Auth from '../Auth';
import './Auth.scss';

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
  const items = sites.map((site) => {
    const { url } = site;
    const session = sessions[url];
    const isOnline = session !== undefined;

    const title = <Auth.SiteTitle
      url={url}
      session={session}
    />;

    const content = isOnline ? (
      <Auth.SiteStatus url={url} session={session} onLogout={onLogout}></Auth.SiteStatus>
    ) : (
      <Auth.Login site={site} onLogin={onLogin} sitePrefs={sitePrefs.sites[url]} {...loginStatus[url]}></Auth.Login>
    );

    return {
      key: url,
      title,
      content,
    };
  });

  const defaultSelected = sites.length === 1 ? sites[0].url : Object.keys(sessions).length <= 1 ? sitePrefs.lastUsed : undefined;

  return (
    <section className="popup-auth">
      <ListView items={items} defaultSelected={defaultSelected} />
    </section>
  );
};

export default PopupAuth;
