import '../../__mocks__/browser';

////////////////////////////////////////////////////////////
// Set up mocks for browser storage API.

const results: Results = new Map<string, SSObject[]>([
  ['host', [{
    id: '1',
    templateId: '4',
    vaultId: '139',
    name: 'Host',
    type: 'Login',
    icon: 'ico_server',
    isDecrypted: false,
    fields: [
      {
        name: 'host',
        title: 'Host / IP',
        value: 'Host',
        isEncrypted: false,
        isPassword: false,
      },
      {
        name: 'username',
        title: 'Username',
        value: 'Username',
        isEncrypted: false,
        isPassword: false,
      },
      {
        name: 'password',
        title: 'Password',
        value: undefined,
        isEncrypted: true,
        isPassword: true,
      },
    ],
  }]],
  ['other', []],
]);
const serializableResults: SerializableResults = Array.from(results);

const decryptedResult: SSObject = {
  id: '1',
  templateId: '4',
  vaultId: '139',
  name: 'Host',
  type: 'Login',
  icon: 'ico_server',
  isDecrypted: true,
  fields: [
    {
      name: 'host',
      title: 'Host / IP',
      value: 'Host',
      isEncrypted: false,
      isPassword: false,
    },
    {
      name: 'username',
      title: 'Username',
      value: 'Username',
      isEncrypted: false,
      isPassword: false,
    },
    {
      name: 'password',
      title: 'Password',
      value: 'Password',
      isEncrypted: true,
      isPassword: true,
    },
  ],
}

const tabResults: TabResults = new Map([
  [1, results],
]);
const serializableTabResults = [
  [1, serializableResults],
];

const sessions: Sessions = new Map([
  ['other', {
    apikey: 'abc123',
    token: 'token',
    createdAt: 1,
    warnings: {},
    violations: {},
    timeout: 14400000,
  }],
]);
const serializableSessions: SerializableSessions = Array.from(sessions);

const mockSessions: Sessions = new Map([
  ...sessions,
  ['host', {
    token: 'token',
    createdAt: 0,
    warnings: {},
    violations: { key: 'violation' },
    timeout: 14400000,
  }],
]);
const serializableMockSessions: SerializableSessions = Array.from(mockSessions);

const local = {
  sessions: serializableSessions,
  tabResults: serializableTabResults,
};

const localSetMock = jest.fn(() => Promise.resolve());
const localGetMock = jest.fn((key: 'sessions' | 'tabResults') => {
  return Promise.resolve({ [key]: local[key] })
});
const errorMock = jest.fn();

global.browser.storage.local.get = localGetMock;
global.browser.storage.local.set = localSetMock;
global.Date.now = jest.fn(() => 0);
global.console.error = errorMock;
jest.mock('storedsafe');

////////////////////////////////////////////////////////////
// Start tests

import * as StoredSafe from './StoredSafe';

const loginFields: TOTPFields & YubiKeyFields = {
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
      { host: 'host', apikey: 'apikey' },
      { ...loginFields, loginType: 'totp'},
    ).then((newSessions) => {
      expect(newSessions).toEqual(sessions);
      expect(localSetMock).toHaveBeenCalledWith({
        sessions: serializableMockSessions,
      });
    })
  ));

  test('.login(), yubikey', () => (
    StoredSafe.actions.login(
      { host: 'host', apikey: 'apikey' },
      {
        ...loginFields,
        loginType: 'yubikey',
      },
    ).then((newSessions) => {
      expect(newSessions).toEqual(sessions);
      expect(localSetMock).toHaveBeenCalledWith({
        sessions: serializableMockSessions,
      });
    })
  ));

  test('.logout()', () => {
    localGetMock.mockImplementationOnce((key: string) => Promise.resolve({
      [key]: serializableMockSessions,
    }));
    return StoredSafe.actions.logout(
      'host',
    ).then((newSessions) => {
      expect(newSessions).toEqual(sessions);
      expect(localSetMock).toHaveBeenCalledWith({
        sessions: serializableSessions,
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
    localGetMock.mockImplementation((key: string) => Promise.resolve({
      [key]: serializableMockSessions,
    }));

    return StoredSafe.actions.find('host', 'host').then((findResults) => {
      expect(findResults).toEqual(results.get('host'));
    })
  });

  test('.find(), error', () => {
    localGetMock.mockImplementationOnce((key: string) => Promise.resolve({
      [key]: serializableMockSessions,
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
      [key]: serializableMockSessions,
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
      sessions: serializableMockSessions,
    }));

    return StoredSafe.actions.tabFind(1, 'host').then((tabResults) => {
      expect(tabResults.get(1)).toEqual(results);
      expect(errorMock).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
