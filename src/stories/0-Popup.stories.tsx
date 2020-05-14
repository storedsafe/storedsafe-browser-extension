import React, { useState } from 'react';
import { StoredSafeResponse  } from 'storedsafe';
import { Site } from '../model/Sites';
import { Sessions } from '../model/Sessions';
import { SitePrefs } from '../model/SitePrefs';
import { SearchResults } from '../model/Search';
import data from './ssVault.json';
import { action } from '@storybook/addon-actions';
import svg from '../ico/svg';
import * as Popup from '../components/ui/Popup';
import * as Search from '../components/ui/Search';
import * as Auth from '../components/ui/Auth';

const ssResponse: StoredSafeResponse = data;

export default {
  title: 'Popup',
  component: Popup,
}

const menuItems = [
  {
    title: 'Search',
    icon: svg.search,
  },
  {
    title: 'Sessions',
    icon: svg.vault,
  },
  {
    title: 'Settings',
    icon: svg.settings,
  },
];

export const PopupSearch: React.FunctionComponent = () => {
  const [needle, setNeedle] = useState<string>('');
  const [selected, setSelected] = useState<{ url: string; id: number }>();

  const siteResults = React.useMemo(() => Object.keys(ssResponse.OBJECT).map((id) => ({
    ssObject: ssResponse.OBJECT[id],
    ssTemplate: ssResponse.TEMPLATESINFO[ssResponse.OBJECT[id].templateid],
  })).filter(({ ssObject }) => new RegExp(needle).test(ssObject.objectname) && ssObject.objectname !== '')
  , [needle])

  const results: SearchResults = {
    'loading.example.com': { loading: true, results: [] },
    'safe.example.com': { loading: false, results: siteResults },
  };

  const menu = <Popup.Menu items={menuItems} selected={0} onSelect={action('popup-menu')} />
  const left = (<Search.Search
    needle={needle}
    onChange={(newNeedle): void => { setSelected(undefined); setNeedle(newNeedle) }}
    onSearch={action('search')}
    results={results}
    onSelect={setSelected}
    selected={selected}
  />
  );

  const onCopy = (field: string): void => {
    const result = results[selected.url].results[selected.id];
    const value = result.ssTemplate.STRUCTURE[field].encrypted ? (
      result.ssObject.crypted && result.ssObject.crypted[field]
    ) : result.ssObject.public[field];
    navigator.clipboard.writeText(value).then(() => {
      setTimeout(() => {
        navigator.clipboard.writeText('').then(() => action('clipboard-clear')(value));
      }, 2000);
    });
    action('copy')(value);
  };
  const right = <Search.ObjectView onFill={action('fill')} onCopy={onCopy} onDecrypt={action('decrypt')} selected={selected} results={results}  />;
  const status = <Popup.StatusBar activeSessions={1} />;
  const content = <Popup.Content left={left} right={right} />

  return (
    <Popup.Main content={content} menu={menu} status={status} />
  );
};

export const PopupSessions: React.FunctionComponent = () => {
  const [selected, setSelected] = useState<number>();

  const siteStatus: {
    [url: string]: {
      errors: string[];
      warnings: string[];
    };
  } = {
    'errors.longurlnameevenlonger.com': {
      warnings: ['Weak passwords detected', 'StoredSafe update available'],
      errors: ['Invalid configuration'],
    },
    'safe.example.com': {
      warnings: [],
      errors: ['Invalid configuration'],
    },
    'clean.example.com': {
      warnings: [],
      errors: [],
    },
    'totp.example.com': {
      warnings: [],
      errors: [],
    },
  };

  const [sessions, setSessions] = useState<Sessions>({
    'safe.example.com': {
      apikey: 'abc123',
      token: '12345',
      createdAt: Date.now(),
      ...siteStatus['safe.example.com'],
    },
    'errors.longurlnameevenlonger.com': {
      apikey: 'xyz987',
      token: '987654',
      createdAt: Date.now(),
      ...siteStatus['errors.longurlnameevenlonger.com'],
    },
    'clean.example.com': {
      apikey: 'clean',
      token: 'clean',
      createdAt: Date.now(),
      ...siteStatus['clean.example.com'],
    }
  });

  const sites: Site[] = [
    { url: 'safe.example.com', apikey: 'abc123' },
    { url: 'errors.longurlnameevenlonger.com', apikey: 'xyz987' },
    { url: 'clean.example.com', apikey: 'q1w2e3' },
    { url: 'totp.example.com', apikey: 'q1w2e3' },
  ];

  const sitePrefs: SitePrefs = {
    'totp.example.com': {
      username: 'oscar',
      loginType: 'totp',
    }
  };

  const removeSession = (id: number): void => {
    const newSessions: Sessions = {};
    Object.keys(sessions).forEach((url) => {
      if (url !== sites[id].url) {
        newSessions[url] = sessions[url];
      }
    });
    setSessions(newSessions);
    action('logout')(sites[id].url);
  };

  const addSession = (id: number): void => {
    setSessions({
      ...sessions,
      [sites[id].url]: {
        apikey: sites[id].apikey,
        token: Array.from({ length: 10 }).map(() => (
          Math.floor(Math.random() * 9)
        )).join(''),
        createdAt: Date.now(),
        ...siteStatus[sites[id].url],
      }
    });
    action('login')(sites[id].url);
  };

  const onSelect = (id: number): void => setSelected(id === selected ? undefined : id);

  const url = sites[selected] && sites[selected].url;

  const menu = <Popup.Menu items={menuItems} selected={1} onSelect={action('popup-menu')} />;
  const left = <Auth.SiteList sites={sites} sessions={sessions} selected={selected} onSelect={onSelect} />;
  const right = url === undefined ? null : sessions[url] !== undefined ? (
    <Auth.SiteStatus url={url} session={sessions[url]} onLogout={(): void => removeSession(selected)} />
  ) : (
    <Auth.Login key={url} url={url} sitePrefs={sitePrefs[url]} onLogin={(): void => addSession(selected)} />
  );
  const status = <Popup.StatusBar activeSessions={Object.keys(sessions).length} />;
  const content = <Popup.Content left={left} right={right} />

  return (
    <Popup.Main content={content} menu={menu} status={status} />
  );
};

export const PopupEmpty: React.FunctionComponent = () => {
  return (
    <Popup.Main content="content" menu="menu" status="status" />
  );
};
