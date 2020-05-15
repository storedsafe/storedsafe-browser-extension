import React, { useState } from 'react';
import { useStorage } from '../../hooks/useStorage';
import * as PopupUI from '../ui/Popup';
import { SiteList, SiteStatus, Login, OnLoginCallback } from '../ui/Auth';

const PopupSearch: React.FunctionComponent = () => {
  const { state, dispatch } = useStorage();
  const [selected, setSelected] = useState<number>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const url = selected !== undefined ? state.sites.list[selected].url : undefined;

  /**
   * Events
   * */
  const onLogin: OnLoginCallback = (fields): void => {
    setLoading(true);
    const site = state.sites.list[selected];
    dispatch({
      sessions: {
        type: 'login',
        site,
        fields,
      },
      sitePrefs: {
        type: 'update',
        url: site.url,
        username: fields.remember ? fields.username : undefined,
        loginType: fields.loginType,
      },
    }, {
      onSuccess: () => setLoading(false),
      onError: (error) => { setLoading(false); setError(error.message) },
    });
  };

  const onLogout = (): void => {
    setLoading(true);
    const url = state.sites.list[selected].url;
    const session = state.sessions[url];
    dispatch({
      sessions: {
        type: 'logout',
        url,
        session,
      }
    }, {
      onSuccess: () => setLoading(false),
      onError: (error) => { setLoading(false); console.error(error) },
    });
  };

  /**
   * Components
   * */
  const left = <SiteList
    sites={state.sites.list}
    sessions={state.sessions}
    onSelect={(id): void => setSelected(id === selected ? undefined : id)}
    selected={selected}
  />;

  const right = selected === undefined ? null : state.sessions[url] ? (
    <SiteStatus
      url={url}
      session={state.sessions[url]}
      onLogout={onLogout}
    />
  ) : (
    <Login
      url={url}
      onLogin={onLogin}
      loading={loading}
      sitePrefs={state.sitePrefs[url]}
      error={error}
    />
  );

  return (
    <PopupUI.Content
      left={left}
      right={right}
    />
  );
};

export default PopupSearch;
