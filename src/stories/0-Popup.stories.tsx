import React, { useState } from 'react';
import { action } from '@storybook/addon-actions';
import { StoredSafeResponse  } from 'storedsafe';
import { Sessions } from '../model/Sessions';
import { Site } from '../model/Sites';
import { SearchResults, SiteSearchResults, SearchResultFields } from '../model/Search';
import data from './ssVault';
import * as Popup from '../components/Popup';

const ssResponse: StoredSafeResponse = data;
const results: SiteSearchResults = {};
ssResponse.OBJECTS.forEach((ssObject) => {
  const ssTemplate = ssResponse.TEMPLATES.find((template) => template.id === ssObject.templateid);
  const isFile = ssObject.templateid === '3';
  const name = isFile ? ssObject.filename : ssObject.objectname;
  const { name: type, ico: icon } = ssTemplate.info;
  const fields: SearchResultFields = {};
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
    fields[field] = { title, value, isEncrypted, isShowing, isPassword };
  });
  results[ssObject.id] = { name, type, icon, isDecrypted, fields };
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
  const sessions: Sessions = {};
  const sites: Site[] = [];
  const { needle, onNeedleChange } = useSearch();

  return (
    <Popup.Main
      isInitialized={false}
      search={{
        urls: [],
        results: {},
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
        sitePrefs: {},
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
  const sessions: Sessions = {};
  const sites: Site[] = [
    {
      url: 'foo.example.com',
      apikey: 'abc123',
    }
  ];

  return (
    <Popup.Main
      isInitialized={true}
      search={{
        urls: [],
        results: {},
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
        sitePrefs: {},
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
  const [searchResults, setSearchResults] = useState<SearchResults>({
    'foo.example.com': results
  });

  const sessions: Sessions = {
    'foo.example.com': {
      apikey: 'abc123',
      token: 'abcdefgh12345678',
      createdAt: Date.now() - Math.random() * 60000,
      violations: {},
      warnings: {},
    },
  };

  const sites: Site[] = [
    {
      url: 'foo.example.com',
      apikey: 'abc123',
    },
    {
      url: 'bar.example.com',
      apikey: 'xyz987',
    }
  ];

  const onShow = (url: string, id: string, field: string): void => {
    setSearchResults((prevSearchResults) => {
      const newSearchResults = { ...prevSearchResults };
      // Mimic API behavior of decrypting the entire object,
      // but only set isDecrypted on requested field.
      newSearchResults[url][id].isDecrypted = true;
      Object.keys(newSearchResults[url][id].fields).forEach((resultField) => {
        if (newSearchResults[url][id].fields[resultField].isEncrypted) {
          newSearchResults[url][id].fields[resultField].value = 'd3<ryPTed';
        }
      });
      newSearchResults[url][id].fields[field].isShowing = true;
      return newSearchResults;
    });
    action('show')(url, id, field);
  };

  let searchStatus: {
    [url: string]: { loading: boolean };
  } = {};

  const filteredResults = needle === '' ? searchResults : {};
  if (needle !== '') {
    searchStatus = {};
    Object.keys(searchResults).forEach((url) => {
      filteredResults[url] = {};
      searchStatus[url] = { loading: false };
      Object.keys(searchResults[url]).forEach((id) => {
        if (new RegExp(needle, 'i').test(searchResults[url][id].name)) {
          filteredResults[url][id] = searchResults[url][id];
        }
      });
    });
  }

  return (
    <Popup.Main
      isInitialized={true}
      search={{
        urls: Object.keys(filteredResults),
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
        sitePrefs: {},
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

  const sessions: Sessions = {
    'foo.example.com': {
      apikey: 'abc123',
      token: 'abcdefgh12345678',
      createdAt: Date.now() - Math.random() * 60000,
      violations: {},
      warnings: {},
    },
  };

  const sites: Site[] = [
    {
      url: 'foo.example.com',
      apikey: 'abc123',
    },
  ];

  const searchStatus: {
    [url: string]: { loading: boolean; error?: string };
  } = {
    'foo.example.com': {
      loading: true,
      error: 'Network Error',
    },
  };

  return (
    <Popup.Main
      isInitialized={true}
      search={{
        urls: Object.keys(sessions),
        needle,
        onNeedleChange,
        onSearch: action('search'),
        results: {},
        onShow: action('show'),
        onCopy: action('copy'),
        onFill: action('fill'),
        searchStatus,
      }}
      auth={{
        sites,
        sessions,
        sitePrefs: {},
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
  const [searchResults, setSearchResults] = useState<SearchResults>({
    'foo.example.com': { '1278': results['1278'] },
    'bar.example.com': { '1279': results['1279'] },
  });

  const sessions: Sessions = {
    'foo.example.com': {
      apikey: 'abc123',
      token: 'abcdefgh12345678',
      createdAt: Date.now() - Math.random() * 3600000,
      violations: {},
      warnings: {},
    },
    'bar.example.com': {
      apikey: 'xyz987',
      token: 'abcdefgh12345678',
      createdAt: Date.now() - Math.random() * 3600000,
      violations: { 'KEY': 'Maximum number of users exceeded.' },
      warnings: { 'KEY': 'Weak password detected' },
    },
    'error.example.com': {
      apikey: 'xyz987',
      token: 'abcdefgh12345678',
      createdAt: Date.now() - Math.random() * 3600000,
      violations: { 'KEY': 'Maximum number of users exceeded.' },
      warnings: {},
    },
    'warning.example.com': {
      apikey: 'xyz987',
      token: 'abcdefgh12345678',
      createdAt: Date.now() - Math.random() * 3600000,
      violations: {},
      warnings: { 'KEY': 'Weak password detected' },
    },
  };

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
      url: 'foo.example.com',
      apikey: 'abc123',
    },
    {
      url: 'bar.example.com',
      apikey: 'xyz987',
    },
    {
      url: 'error.example.com',
      apikey: 'xyz987',
    },
    {
      url: 'warning.example.com',
      apikey: 'xyz987',
    },
    {
      url: 'offline.example.com',
      apikey: 'xyz987',
    },
    {
      url: 'extra.example.com',
      apikey: 'xyz987',
    },
  ];

  const sitePrefs = {
    'offline.example.com': {
      loginType: 'totp' as 'totp',
      username: 'myusername',
    },
  };

  const onShow = (url: string, id: string, field: string): void => {
    setSearchResults((prevSearchResults) => {
      const newSearchResults = { ...prevSearchResults };
      // Mimic API behavior of decrypting the entire object,
      // but only set isDecrypted on requested field.
      newSearchResults[url][id].isDecrypted = true;
      Object.keys(newSearchResults[url][id].fields).forEach((resultField) => {
        if (newSearchResults[url][id].fields[resultField].isEncrypted) {
          newSearchResults[url][id].fields[resultField].value = 'd3<ryPTed';
        }
      });
      newSearchResults[url][id].fields[field].isShowing = true;
      return newSearchResults;
    });
    action('show')(url, id, field);
  };

  const loginStatus = {
    'offline.example.com': {
      error: 'Invalid username, passphrase or apikey.',
      loading: true,
    },
  };

  return (
    <Popup.Main
      isInitialized={true}
      search={{
        urls: Object.keys(sessions),
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
        sitePrefs,
        onLogin: action('login'),
        onLogout: action('login'),
        loginStatus,
      }}
      openOptions={action('options')}
    />
  );
};
