import '../__mocks__/browser';
import { Sessions } from './Sessions';
import { Search, SearchResults, SearchResult } from './Search';

const searchResults: SearchResults = {
  'host': {
    '1': {
      name: 'Host',
      type: 'Login',
      icon: 'ico_server',
      isDecrypted: false,
      fields: {
        'host': {
          title: 'Host / IP',
          value: 'Host',
          isEncrypted: false,
          isPassword: false,
        },
        'username': {
          title: 'Username',
          value: 'Username',
          isEncrypted: false,
          isPassword: false,
        },
        'password': {
          title: 'Password',
          value: undefined,
          isEncrypted: true,
          isPassword: true,
        },
      },
    },
  },
  'other': {
  },
};

const decryptedResult: SearchResult = {
  name: 'Host',
  type: 'Login',
  icon: 'ico_server',
  isDecrypted: true,
  fields: {
    'host': {
      title: 'Host / IP',
      value: 'Host',
      isEncrypted: false,
      isPassword: false,
    },
    'username': {
      title: 'Username',
      value: 'Username',
      isEncrypted: false,
      isPassword: false,
    },
    'password': {
      title: 'Password',
      value: 'Password',
      isEncrypted: true,
      isPassword: true,
    },
  },
}

const search: Search = {
  1: searchResults,
};

const sessions: Sessions = {
  'other': {
    apikey: 'abc123',
    token: 'asdfhjk',
    createdAt: 1,
    warnings: {},
    violations: {},
  },
};

const mockSessions: Sessions = {
  ...sessions,
  'host': {
    apikey: 'apikey',
    token: 'token',
    createdAt: 0,
    warnings: {},
    violations: { key: 'violation' },
  },
};

const local = {
  sessions,
  search,
};

const localSetMock = jest.fn(() => Promise.resolve());
const localGetMock = jest.fn((key: 'sessions' | 'search') => {
  return Promise.resolve({ [key]: local[key] })
});
const errorMock = jest.fn();

global.browser.storage.local.get = localGetMock;
global.browser.storage.local.set = localSetMock;
global.Date.now = jest.fn(() => 0);
global.console.error = errorMock;
jest.mock('storedsafe');

import * as StoredSafe from './StoredSafe';

const loginFields: StoredSafe.TOTPFields & StoredSafe.YubiKeyFields = {
  username: 'username',
  keys: 'passphraseoooooooooooooooooooooooooooooooooooooooooooo',
  passphrase: 'passphrase',
  otp: 'otp',
};

describe('Sessions', () => {
  beforeEach(() => {
    localSetMock.mockClear();
    localGetMock.mockClear();
  });

  test('.login(), totp', () => (
    StoredSafe.actions.login(
      { url: 'host', apikey: 'apikey' },
      {
        ...loginFields,
        loginType: 'totp',
      },
    ).then((newSessions) => {
      expect(newSessions).toBe(sessions);
      expect(localSetMock).toHaveBeenCalledWith({
        sessions: mockSessions
      });
    })
  ));

  test('.login(), yubikey', () => (
    StoredSafe.actions.login(
      { url: 'host', apikey: 'apikey' },
      {
        ...loginFields,
        loginType: 'yubikey',
      },
    ).then((newSessions) => {
      expect(newSessions).toBe(sessions);
      expect(localSetMock).toHaveBeenCalledWith({
        sessions: mockSessions
      });
    })
  ));

  test('.logout()', () => {
    localGetMock.mockImplementationOnce((key: string) => Promise.resolve({
      [key]: mockSessions,
    }));
    return StoredSafe.actions.logout(
      'host',
    ).then((newSessions) => {
      expect(newSessions).toBe(sessions);
      expect(localSetMock).toHaveBeenCalledWith({
        sessions
      });
    });
  });
});

describe('Search', () => {
  beforeEach(() => {
    localSetMock.mockClear();
    localGetMock.mockClear();
    errorMock.mockClear();
  });

  test('.find()', () => {
    localGetMock.mockImplementationOnce((key: string) => Promise.resolve({
      [key]: mockSessions,
    }));

    return StoredSafe.actions.find(
      'host',
      'host'
    ).then((results) => {
      expect(results).toEqual(searchResults['host']);
    })
  });

  test('.find(), error', () => {
    localGetMock.mockImplementationOnce((key: string) => Promise.resolve({
      [key]: mockSessions,
    }));

    return StoredSafe.actions.find(
      'other',
      'host'
    ).catch((error) => {
      expect(error.message).toMatch('StoredSafe Error');
    })
  });

  test('.decrypt()', () => {
    localGetMock.mockImplementationOnce((key: string) => Promise.resolve({
      [key]: mockSessions,
    }));

    return StoredSafe.actions.decrypt(
      'host',
      '1'
    ).then((result) => {
      expect(result).toEqual(decryptedResult);
    })
  });

  test('.tabFind()', () => {
    localGetMock.mockImplementation(() => Promise.resolve({
      ...local,
      sessions: mockSessions,
    }));

    return StoredSafe.actions.tabFind(
      1,
      'host'
    ).then((search) => {
      expect(search[1]).toEqual(searchResults);
      expect(errorMock).toHaveBeenCalledWith(expect.any(Error));
    })
  });
});
