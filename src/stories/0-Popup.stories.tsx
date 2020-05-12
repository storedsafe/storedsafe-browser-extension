import React, { useState, useEffect } from 'react';
import { StoredSafeResponse, StoredSafeObject, StoredSafeTemplate } from 'storedsafe';
import { Site } from '../model/Sites';
import { Sessions } from '../model/Sessions';
import { SitePrefs } from '../model/SitePrefs';
import data from './ssVault.json';
import { action } from '@storybook/addon-actions';
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
    icon: (
      <svg width="40" height="40" version="1.1" viewBox="0 0 10.583 10.583" xmlns="http://www.w3.org/2000/svg"><path transform="scale(.26458)" d="m27.486 0a12.5 12.5 0 00-12.486 12.5 12.5 12.5 0 002.3145 7.2441 12.5 12.5 0 000 .001953l-17.314 17.312 2.9414 2.9414 17.312-17.312a12.5 12.5 0 007.2461 2.3125 12.5 12.5 0 0012.5-12.5 12.5 12.5 0 00-12.5-12.5 12.5 12.5 0 00-.013672 0zm-.11914 3.6641a8.8361 8.8361 0 01.13281 0 8.8361 8.8361 0 018.8359 8.8359 8.8361 8.8361 0 01-8.8359 8.8359 8.8361 8.8361 0 01-8.8359-8.8359 8.8361 8.8361 0 018.7031-8.8359z"/></svg>
    ),
  },
  {
    title: 'Sessions',
    icon: (
      <svg width="40" height="40" version="1.1" viewBox="0 0 10.583 10.583" xmlns="http://www.w3.org/2000/svg"><path transform="scale(.26458)" d="m5.2637 0c-2.9158 5.9212e-16-5.2637 2.288-5.2637 5.1309v28.738c5.9212e-16 2.8429 2.3479 5.1309 5.2637 5.1309h-.26367v1h3v-1h24v1h3v-1h-.26367c2.9158 0 5.2637-2.288 5.2637-5.1309v-28.738c0-2.8429-2.3479-5.1309-5.2637-5.1309h-29.473zm1.2812 1.6973h26.91c2.662 0 4.8047 2.0901 4.8047 4.6855v26.234c0 2.5955-2.1427 4.6855-4.8047 4.6855h-26.91c-2.662 0-4.8047-2.0901-4.8047-4.6855v-26.234c0-2.5955 2.1427-4.6855 4.8047-4.6855zm.83984 1.1074c-2.4963 0-4.5078 1.9607-4.5078 4.3945v24.602c0 2.4338 2.0116 4.3945 4.5078 4.3945h25.23c2.4963 0 4.5078-1.9607 4.5078-4.3945v-24.602c0-2.4338-2.0116-4.3945-4.5078-4.3945h-25.23zm20.492 11.256a5.9606 5.9606 0 01.125 0 5.9606 5.9606 0 015.959 5.959 5.9606 5.9606 0 01-5.959 5.959 5.9606 5.9606 0 01-5.9629-5.959 5.9606 5.9606 0 015.8379-5.959zm.125 1.4453a4.5134 4.5134 0 00-4.5137 4.5137 4.5134 4.5134 0 004.5137 4.5137 4.5134 4.5134 0 004.5117-4.5137 4.5134 4.5134 0 00-4.5117-4.5137zm-18.609.14844a4.3661 4.3661 0 012.2793.58398 4.3661 4.3661 0 012.0449 2.6992h3.0117c.39944 0 .7207.32127.7207.7207v.72266c0 .39944-.32126.7207-.7207.7207h-3.0117a4.3661 4.3661 0 01-.44727 1.1016 4.3661 4.3661 0 01-5.9648 1.5977 4.3661 4.3661 0 01-1.5977-5.9648 4.3661 4.3661 0 013.6855-2.1816zm18.609 1a3.3644 3.3644 0 013.3633 3.3652 3.3644 3.3644 0 01-3.3633 3.3652 3.3644 3.3644 0 01-3.3652-3.3652 3.3644 3.3644 0 013.3652-3.3652zm-18.57.58203a2.7845 2.7845 0 00-2.3555 1.3906 2.7845 2.7845 0 001.0195 3.8027 2.7845 2.7845 0 003.8027-1.0176 2.7845 2.7845 0 00-1.0176-3.8027 2.7845 2.7845 0 00-1.4492-.37305z"/></svg>
    ),
  },
  {
    title: 'Settings',
    icon: (
      <svg width="40" height="40" version="1.1" viewBox="0 0 10.583 10.583" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0 -286.42)"><path d="m4.8943 286.42c-.1781-.002-.29665.0502-.41163.34759-.18397.47571-.35953.99273-.75923 1.1583-.3997.16555-.88962-.0761-1.3561-.28242-.46649-.20633-.49962.0325-.80554.33846-.30592.3059-.54479.33905-.33845.80553.20634.46647.44797.95638.28243 1.3561-.16555.3997-.68256.57526-1.1583.75923-.47573.18397-.32473.37635-.32473.80896s-.15099.62498.32473.80895c.47573.18397.99274.35953 1.1583.75922.16555.3997-.076087.8896-.28243 1.3561-.20634.46648.032536.49961.33845.80553.30592.30591.33906.54478.80554.33845.46649-.20634.9564-.44797 1.3561-.28242.3997.16555.57526.68255.75923 1.1583.18397.47573.37635.32474.80897.32474s.625.15099.80897-.32474c.18397-.47571.35953-.99271.75923-1.1583.3997-.16555.88961.0761 1.3561.28242.46649.20633.49962-.0325.80554-.33845.30592-.30592.54479-.33905.33845-.80553-.20634-.46648-.44797-.95638-.28243-1.3561.16555-.39969.68256-.57525 1.1583-.75922.47573-.18397.32473-.37634.32473-.80895s.15099-.62499-.32473-.80896c-.47573-.18397-.99274-.35953-1.1583-.75923-.16555-.39969.076087-.8896.28243-1.3561.20634-.46648-.032536-.49963-.33845-.80553-.30592-.30592-.33906-.54479-.80554-.33846-.46649.20634-.9564.44797-1.3561.28242-.3997-.16553-.5758-.68255-.75981-1.1583-.18401-.47573-.37593-.32473-.8084-.32473-.16223 0-.29048-.0214-.39734-.0229zm.39734 2.8208a2.4711 2.4711 0 012.4709 2.4709 2.4711 2.4711 0 01-2.4709 2.4709 2.4711 2.4711 0 01-2.4709-2.4709 2.4711 2.4711 0 012.4709-2.4709z"/></g></svg>
    ),
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

  const results: {
    [url: string]: {
      ssObject: StoredSafeObject;
      ssTemplate: StoredSafeTemplate;
    }[];
  } = {
    'safe.example.com': siteResults,
  };

  const menu = <Popup.Menu items={menuItems} selected={0} onClick={action('popup-menu')} />
  const left = (<Search.Search
    needle={needle}
    onChange={(newNeedle): void => { setSelected(undefined); setNeedle(newNeedle) }}
    onSearch={action('search')}
    results={results}
    onSelect={(url, id): void => setSelected({ url, id })}
    selected={selected}
  />
  );

  const onCopy = (value: string): void => {
    navigator.clipboard.writeText(value).then(() => {
      setTimeout(() => {
        navigator.clipboard.writeText('').then(() => action('clipboard-clear')(value));
      }, 2000);
    });
    action('copy')(value);
  };
  const right = <Search.ObjectView onFill={action('fill')} onCopy={onCopy} onDecrypt={action('decrypt')} selected={selected} results={results}  />;
  const status = <Auth.StatusBar activeSessions={1} />;

  return (
    <Popup.Main left={left} right={right} menu={menu} status={status} />
  );
};

export const PopupSessions: React.FunctionComponent = () => {
  const [selected, setSelected] = useState<number>();
  const [sessions, setSessions] = useState<Sessions>({
    'safe.example.com': {
      apikey: 'abc123',
      token: '12345',
      createdAt: Date.now(),
    },
    'errors.longurlnameevenlonger.com': {
      apikey: 'xyz987',
      token: '987654',
      createdAt: Date.now(),
    },
    'clean.example.com': {
      apikey: 'clean',
      token: 'clean',
      createdAt: Date.now(),
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
      }
    });
    action('login')(sites[id].url);
  };

  const sitesStatus: {
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

  const onSelect = (id: number): void => setSelected(id === selected ? undefined : id);

  const url = sites[selected] && sites[selected].url;

  const menu = <Popup.Menu items={menuItems} selected={1} onClick={action('popup-menu')} />;
  const left = <Auth.SiteList sitesStatus={sitesStatus} sites={sites} sessions={sessions} selected={selected} onSelect={onSelect} />;
  const right = url === undefined ? null : sessions[url] !== undefined ? (
    <Auth.SiteStatus url={url} {...sitesStatus[url]} createdAt={sessions[url].createdAt} onLogout={(): void => removeSession(selected)} />
  ) : (
    <Auth.Login key={url} url={url} sitePrefs={sitePrefs[url]} onSubmit={(): void => addSession(selected)} />
  );
  const status = <Auth.StatusBar activeSessions={Object.keys(sessions).length} />;

  return (
    <Popup.Main left={left} right={right} menu={menu} status={status} />
  );
};

export const PopupEmpty: React.FunctionComponent = () => {
  return (
    <Popup.Main left="left" right="right" menu="menu" status="status" />
  );
};

