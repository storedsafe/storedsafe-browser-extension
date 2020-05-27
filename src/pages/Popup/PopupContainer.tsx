import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useStorage } from '../../hooks/useStorage';
import { OnLoginCallback } from '../../components/Auth/Login';
import * as Popup from '../../components/Popup';

export const PopupContainer: React.FunctionComponent = () => {
  const { state, dispatch, isInitialized } = useStorage();
  const { login, logout, loginStatus } = useAuth();
  const [searchTimeout, setSearchTimeout] = useState<number>();

  const openOptions = (): void => { browser.runtime.openOptionsPage() };

  const onLogin: OnLoginCallback = (site, values) => {
    dispatch({
      sitePrefs: {
        type: 'update',
        url: site.url,
        username: values.remember ? values.username : undefined,
        loginType: values.loginType,
      },
    });
    login(site, values);
  };

  const onSearch = (needle: string): void => {
    if (searchTimeout) setSearchTimeout(undefined);
    dispatch({
      search: {
        type: 'find',
        urls: Object.keys(state.sessions),
        needle,
      },
    });
  };

  const onNeedleChange = (needle: string): void => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    setSearchTimeout(window.setTimeout((): void => onSearch(needle), 1500));
  };

  const onCopy = (value: string): void => {
    // TODO: Decrypt first
    navigator.clipboard.writeText(value).then(() => {
      setTimeout(() => {
        navigator.clipboard.writeText('');
      }, 30000);
    });
  };

  const onShow = (url: string, objectId: string, field: string): void => {
    dispatch({
      search: {
        type: 'show',
        url,
        objectId,
        field,
      },
    });
  };

  const onFill = (url: string, objectId: string): void => {
    // TODO: Decrypt first
    browser.tabs.query({ currentWindow: true, active: true }).then((tabs) => {
      const tab = tabs[0];
      browser.tabs.sendMessage(tab.id, {
        type: 'fill',
        data: state.search[url].objects[objectId],
      });
    });
  };

  return (
    <Popup.Main
      isInitialized={isInitialized}
      search={{
        onSearch,
        onShow,
        onNeedleChange,
        results: state.search,
        onCopy,
        onFill,
      }}
      auth={{
        sites: state.sites.list,
        sessions: state.sessions,
        sitePrefs: state.sitePrefs,
        onLogin: login,
        onLogout: logout,
        loginStatus,
      }}
      openOptions={openOptions}
    />
  );
};
