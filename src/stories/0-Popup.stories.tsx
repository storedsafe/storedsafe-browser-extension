import React, { useState } from 'react';
import { action } from '@storybook/addon-actions';
import { StoredSafeResponse  } from 'storedsafe';
import data from './ssVault';
import * as Popup from '../components/Popup';

const ssResponse: StoredSafeResponse = data;
const results: SSObject[] = [];
ssResponse.OBJECTS.forEach((ssObject) => {
  const ssTemplate = ssResponse.TEMPLATES.find((template) => template.id === ssObject.templateid);
  const { id, groupid: vaultId, templateid: templateId } = ssObject;
  const isFile = ssObject.templateid === '3';
  const name = isFile ? ssObject.filename : ssObject.objectname;
  const { name: type, ico: icon } = ssTemplate.info;
  const fields: SSField[] = [];
  const isDecrypted = ssObject.crypted !== undefined;
  ssTemplate.structure.forEach((templateField) => {
    const field = templateField.fieldname;
    const isShowing = (
      isDecrypted && ssObject.crypted[field] !== undefined
    );
    const {
      translation: title,
      encrypted: isEncrypted,
      policy: isPassword,
    } = templateField;
    const value = (
      isEncrypted
        ? (isDecrypted ? ssObject.crypted[field] : undefined)
        : ssObject.public[field]
    );
    fields.push({ title, value, isEncrypted, isShowing, isPassword, name: field });
  });
  results.push({ id, vaultId, templateId, name, type, icon, isDecrypted, fields });
});

export default {
  title: 'Popup',
  component: Popup,
}

const useSearch = (): {
  needle: string;
  onNeedleChange: (needle: string) => void;
} => {
  const [needle, setNeedle] = useState<string>();
  const onNeedleChange = (needle: string): void => {
    setNeedle(needle);
    action('needle change')(needle);
  };
  return { needle, onNeedleChange };
};

export const PopupLoading: React.FunctionComponent = () => {
  const sessions: Sessions = new Map();
  const sites: Site[] = [];
  const { needle, onNeedleChange } = useSearch();

  return (
    <Popup.Main
      isInitialized={false}
      add={{
        hosts: [],
        onHostChange: action('host change'),
      }}
      search={{
        hosts: [],
        results: new Map(),
        onShow: action('show'),
        onCopy: action('copy'),
        onFill: action('fill'),
        needle,
        onNeedleChange,
        onSearch: action('search'),
        searchStatus: {},
      }}
      auth={{
        sites,
        sessions,
        preferences: { sites: {} },
        onLogin: action('login'),
        onLogout: action('login'),
        loginStatus: {},
      }}
      openOptions={action('options')}
    />
  );
};

export const PopupOffline: React.FunctionComponent = () => {
  const { needle, onNeedleChange } = useSearch();
  const sessions: Sessions = new Map();
  const sites: Site[] = [
    {
      host: 'foo.example.com',
      apikey: 'abc123',
    }
  ];

  return (
    <Popup.Main
      add={{
        hosts: [],
        onHostChange: action('host change'),
      }}
      isInitialized={true}
      search={{
        hosts: [],
        results: new Map(),
        onShow: action('show'),
        onCopy: action('copy'),
        onFill: action('fill'),
        needle,
        onNeedleChange,
        onSearch: action('search'),
        searchStatus: {},
      }}
      auth={{
        sites,
        sessions,
        preferences: { sites: {} },
        onLogin: action('login'),
        onLogout: action('login'),
        loginStatus: {},
      }}
      openOptions={action('options')}
    />
  );
};

export const PopupOnline: React.FunctionComponent = () => {
  const { needle, onNeedleChange } = useSearch();
  const [searchResults, setSearchResults] = useState<Results>(new Map([
    ['foo.example.com', results]
  ]));

  const sessions: Sessions = new Map([
    ['foo.example.com', {
      apikey: 'abc123',
      token: 'abcdefgh12345678',
      createdAt: Date.now() - Math.random() * 60000,
      violations: {},
      warnings: {},
      timeout: 0,
    }],
  ]);

  const sites: Site[] = [
    {
      host: 'foo.example.com',
      apikey: 'abc123',
    },
    {
      host: 'bar.example.com',
      apikey: 'xyz987',
    }
  ];

  const onShow = (host: string, resultId: number, fieldId: number): void => {
    setSearchResults((prevSearchResults) => {
      const newSearchResults = new Map(prevSearchResults);
      // Mimic API behavior of decrypting the entire object,
      // but only set isDecrypted on requested field.
      newSearchResults.get(host)[resultId].isDecrypted = true;
      newSearchResults.get(host)[resultId].fields.forEach((field) => {
        if (field.isEncrypted) {
          field.value = 'd3<ryPTed';
        }
      });
      newSearchResults.get(host)[resultId].fields[fieldId].isShowing = true;
      return newSearchResults;
    });
    action('show')(host, resultId, fieldId);
  };

  let searchStatus: {
    [host: string]: { loading: boolean };
  } = {};

  const filteredResults = needle === '' ? searchResults : new Map();
  if (needle !== '') {
    searchStatus = {};
    for (const [host, results] of searchResults) {
      filteredResults.set(host, []);
      searchStatus[host] = { loading: false };
      results.forEach((result) => {
        if (new RegExp(needle, 'i').test(result.name)) {
          filteredResults.get(host).push(result);
        }
      })
    }
  }

  return (
    <Popup.Main
      add={{
        hosts: Object.keys(filteredResults),
        onHostChange: action('host change'),
      }}
      isInitialized={true}
      search={{
        hosts: Array.from(filteredResults.keys()),
        needle,
        onNeedleChange,
        onSearch: action('search'),
        results: filteredResults,
        onShow: onShow,
        onCopy: action('copy'),
        onFill: action('fill'),
        searchStatus,
      }}
      auth={{
        sites,
        sessions,
        preferences: { lastUsedSite: 'foo.example.com',  sites: {} },
        onLogin: action('login'),
        onLogout: action('login'),
        loginStatus: {},
      }}
      openOptions={action('options')}
    />
  );
};

export const PopupOnlineLoading: React.FunctionComponent = () => {
  const { needle, onNeedleChange } = useSearch();

  const sessions: Sessions = new Map([
    ['foo.example.com', {
      apikey: 'abc123',
      token: 'abcdefgh12345678',
      createdAt: Date.now() - Math.random() * 60000,
      violations: {},
      warnings: {},
      timeout: 0,
    }],
  ]);

  const sites: Site[] = [
    { host: 'foo.example.com', apikey: 'abc123' },
  ];

  const searchStatus: {
    [host: string]: { loading: boolean; error?: string };
  } = {
    'foo.example.com': {
      loading: true,
      error: 'Network Error',
    },
  };

  return (
    <Popup.Main
      add={{
        hosts: Array.from(sessions.keys()),
        onHostChange: action('host change'),
      }}
      isInitialized={true}
      search={{
        hosts: Object.keys(sessions),
        needle,
        onNeedleChange,
        onSearch: action('search'),
        results: new Map(),
        onShow: action('show'),
        onCopy: action('copy'),
        onFill: action('fill'),
        searchStatus,
      }}
      auth={{
        sites,
        sessions,
        preferences: { sites: {} },
        onLogin: action('login'),
        onLogout: action('login'),
        loginStatus: {},
      }}
      openOptions={action('options')}
    />
  );
};

export const PopupMultiple: React.FunctionComponent = () => {
  const { needle, onNeedleChange } = useSearch();
  const [searchResults, setSearchResults] = useState<Results>(new Map([
    ['foo.example.com', [results.find((res) => res.id === '1278')]],
    ['bar.example.com', [results.find((res) => res.id === '1279')]],
  ]));
  const [site, setSite] = useState<string>();

  const siteInfo: Map<string, SSSiteInfo> = new Map([
    ['foo.example.com', {
      vaults: [
        { name: 'Foo 1', id: '1', canWrite: true },
        { name: 'Foo 2', id: '2', canWrite: true },
      ],
      templates: [
        { name: 'T1', icon: '', id: '1', structure: [] },
        { name: 'T2', icon: '', id: '4', structure: [] },
      ],
    }],
    ['bar.example.com', {
      vaults: [
        { name: 'Bar 1', id: '7', canWrite: true },
        { name: 'Bar 2', id: '2', canWrite: false },
      ],
      templates: [
        { name: 'T3', icon: '', id: '3', structure: [] },
        { name: 'T2', icon: '', id: '4', structure: [] },
      ],
    }],
    ['zot.example.com', {
      vaults: [
        { name: 'Bar 1', id: '7', canWrite: false },
        { name: 'Bar 2', id: '2', canWrite: false },
      ],
      templates: [
        { name: 'T2', icon: '', id: '2', structure: [] },
        { name: 'T4', icon: '', id: '4', structure: [] },
      ],
    }],
  ]);

  const sessions: Sessions = new Map([
    ['foo.example.com', {
      apikey: 'abc123',
      token: 'abcdefgh12345678',
      createdAt: Date.now() - Math.random() * 3600000,
      violations: {},
      warnings: {},
      timeout: 0,
    }],
    ['bar.example.com', {
      apikey: 'xyz987',
      token: 'abcdefgh12345678',
      createdAt: Date.now() - Math.random() * 3600000,
      violations: { 'KEY': 'Maximum number of users exceeded.' },
      warnings: { 'KEY': 'Weak password detected' },
      timeout: 0,
    }],
    ['error.example.com', {
      apikey: 'xyz987',
      token: 'abcdefgh12345678',
      createdAt: Date.now() - Math.random() * 3600000,
      violations: { 'KEY': 'Maximum number of users exceeded.' },
      warnings: {},
      timeout: 0,
    }],
    ['warning.example.com', {
      apikey: 'xyz987',
      token: 'abcdefgh12345678',
      createdAt: Date.now() - Math.random() * 3600000,
      violations: {},
      warnings: { 'KEY': 'Weak password detected' },
      timeout: 0,
    }],
  ]);

  const searchStatus = {
    'foo.example.com': {
      loading: false,
    },
    'bar.example.com': {
      loading: false,
    },
    'error.example.com': {
      loading: false,
      error: 'Network Error',
    },
    'warning.example.com': {
      loading: true,
    },
  };

  const sites: Site[] = [
    {
      host: 'foo.example.com',
      apikey: 'abc123',
    },
    {
      host: 'bar.example.com',
      apikey: 'xyz987',
    },
    {
      host: 'error.example.com',
      apikey: 'xyz987',
    },
    {
      host: 'warning.example.com',
      apikey: 'xyz987',
    },
    {
      host: 'offline.example.com',
      apikey: 'xyz987',
    },
    {
      host: 'extra.example.com',
      apikey: 'xyz987',
    },
  ];

  const preferences: Preferences = {
    lastUsedSite: 'foo.example.com',
    sites: {
      'offline.example.com': {
        loginType: 'totp' as 'totp',
        username: 'myusername',
      },
    },
  };

  const onShow = (host: string, resultId: number, fieldId: number): void => {
    setSearchResults((prevSearchResults) => {
      const newSearchResults = { ...prevSearchResults };
      // Mimic API behavior of decrypting the entire object,
      // but only set isDecrypted on requested field.
      newSearchResults.get(host)[resultId].isDecrypted = true;
      newSearchResults.get(host)[resultId].fields.forEach((field) => {
        if (field.isEncrypted) {
          field.value = 'd3<ryPTed';
        }
      });
      newSearchResults.get(host)[resultId].fields[fieldId].isShowing = true;
      return newSearchResults;
    });
    action('show')(host, resultId, fieldId);
  };

  const loginStatus = {
    'offline.example.com': {
      error: 'Invalid username, passphrase or apikey.',
      loading: true,
    },
  };

  const onHostChange = (host: string): void => {
    setSite(host);
    action('host change')(host);
  };

  return (
    <Popup.Main
      add={{
        hosts: Array.from(sessions.keys()),
        vaults: siteInfo.get(site).vaults,
        templates: siteInfo.get(site).templates,
        onHostChange,
      }}
      isInitialized={true}
      search={{
        hosts: Object.keys(sessions),
        needle,
        onNeedleChange,
        onSearch: action('search'),
        results: searchResults,
        onShow: onShow,
        onCopy: action('copy'),
        onFill: action('fill'),
        searchStatus,
      }}
      auth={{
        sites,
        sessions,
        preferences,
        onLogin: action('login'),
        onLogout: action('login'),
        loginStatus,
      }}
      openOptions={action('options')}
    />
  );
};
