import React, { useState } from 'react';
import { action } from '@storybook/addon-actions';
import { StoredSafeResponse  } from 'storedsafe';
import { Sessions } from '../model/Sessions';
import { Site } from '../model/Sites';
import { SearchResults, SiteSearchResults, SearchResultFields } from '../model/Search';
import data from './ssVault.json';
import * as Popup from '../components/ui/Popup';

const ssResponse: StoredSafeResponse = data;
const results: SiteSearchResults = {};
Object.keys(ssResponse.OBJECT).forEach((id) => {
  const ssObject = ssResponse.OBJECT[id];
  const ssTemplate = ssResponse.TEMPLATESINFO[ssObject.templateid];
  const isFile = ssObject.templateid === '3';
  const name = isFile ? ssObject.filename : ssObject.objectname;
  const { name: type, ico: icon } = ssTemplate.INFO;
  const fields: SearchResultFields = {};
  Object.keys(ssTemplate.STRUCTURE).forEach((field) => {
    const isDecrypted = (
      ssObject.crypted !== undefined
      && ssObject.crypted[field] !== undefined
    );
    const {
      translation: title,
      encrypted: isEncrypted,
      policy: isPassword,
    } = ssTemplate.STRUCTURE[field];
    const value = (
      isEncrypted
        ? (isDecrypted ? ssObject.crypted[field] : undefined)
        : ssObject.public[field]
    );
    fields[field] = { title, value, isEncrypted, isDecrypted, isPassword };
  });
  results[id] = { name, type, icon, fields };
});

export default {
  title: 'Popup',
  component: Popup,
}

export const PopupOffline: React.FunctionComponent = () => {
  const sessions: Sessions = {};
  const sites: Site[] = [
    {
      url: 'foo.example.com',
      apikey: 'abc123',
    }
  ];

  return (
    <Popup.Main
      isLoading={false}
      search={{
        onNeedleChange: action('needle change'),
        onSearch: action('search'),
        results: {},
        onDecrypt: action('decrypt'),
        onCopy: action('copy'),
        onFill: action('fill'),
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
  const [searchResults, setSearchResults] = useState<SearchResults>({
    'foo.example.com': results
  });
  const [needle, setNeedle] = useState<string>('');

  const sessions: Sessions = {
    'foo.example.com': {
      apikey: 'abc123',
      token: 'abcdefgh12345678',
      createdAt: Date.now() - Math.random() * 60000,
      errors: [],
      warnings: [],
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

  const onDecrypt = (url: string, id: string, field: string): void => {
    setSearchResults((prevSearchResults) => {
      const newSearchResults = { ...prevSearchResults };
      // Mimic API behavior of decrypting the entire object,
      // but only set isDecrypted on requested field.
      Object.keys(newSearchResults[url][id].fields).forEach((resultField) => {
        if (newSearchResults[url][id].fields[resultField].isEncrypted) {
          newSearchResults[url][id].fields[resultField].value = 'd3<ryPTed';
        }
      });
      newSearchResults[url][id].fields[field].isDecrypted = true;
      return newSearchResults;
    });
    action('decrypt')(url, id, field);
  };

  const filteredResults = needle === '' ? searchResults : {};
  if (needle !== '') {
    Object.keys(searchResults).forEach((url) => {
      filteredResults[url] = {};
      Object.keys(searchResults[url]).forEach((id) => {
        if (new RegExp(needle).test(searchResults[url][id].name)) {
          filteredResults[url][id] = searchResults[url][id];
        }
      });
    });
  }

  return (
    <Popup.Main
      isLoading={false}
      search={{
        onNeedleChange: (needle): void => { setNeedle(needle); action('needle change')(needle) },
        onSearch: action('search'),
        results: filteredResults,
        onDecrypt: onDecrypt,
        onCopy: action('copy'),
        onFill: action('fill'),
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
  const [searchResults, setSearchResults] = useState<SearchResults>({
    'foo.example.com': { '1460': results['1460'] },
    'bar.example.com': { '1456': results['1456'] },
  });

  const sessions: Sessions = {
    'foo.example.com': {
      apikey: 'abc123',
      token: 'abcdefgh12345678',
      createdAt: Date.now() - Math.random() * 3600000,
      errors: [],
      warnings: [],
    },
    'bar.example.com': {
      apikey: 'xyz987',
      token: 'abcdefgh12345678',
      createdAt: Date.now() - Math.random() * 3600000,
      errors: ['Maximum number of users exceeded.'],
      warnings: ['Weak password detected'],
    },
    'error.example.com': {
      apikey: 'xyz987',
      token: 'abcdefgh12345678',
      createdAt: Date.now() - Math.random() * 3600000,
      errors: ['Maximum number of users exceeded.'],
      warnings: [],
    },
    'warning.example.com': {
      apikey: 'xyz987',
      token: 'abcdefgh12345678',
      createdAt: Date.now() - Math.random() * 3600000,
      errors: [],
      warnings: ['Weak password detected'],
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

  const onDecrypt = (url: string, id: string, field: string): void => {
    setSearchResults((prevSearchResults) => {
      const newSearchResults = { ...prevSearchResults };
      // Mimic API behavior of decrypting the entire object,
      // but only set isDecrypted on requested field.
      Object.keys(newSearchResults[url][id].fields).forEach((resultField) => {
        if (newSearchResults[url][id].fields[resultField].isEncrypted) {
          newSearchResults[url][id].fields[resultField].value = 'd3<ryPTed';
        }
      });
      newSearchResults[url][id].fields[field].isDecrypted = true;
      return newSearchResults;
    });
    action('decrypt')(url, id, field);
  };

  const loginStatus = {
    'offline.example.com': {
      error: 'Invalid username, passphrase or apikey.',
      loading: true,
    },
  };

  return (
    <Popup.Main
      isLoading={false}
      search={{
        onNeedleChange: action('needle change'),
        onSearch: action('search'),
        results: searchResults,
        onDecrypt: onDecrypt,
        onCopy: action('copy'),
        onFill: action('fill'),
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
