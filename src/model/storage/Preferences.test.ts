////////////////////////////////////////////////////////////
// Set up mocks for browser storage API.

import '../../__mocks__/browser';
const localSetMock = jest.fn(() => Promise.resolve());
//eslint-disable-next-line
const localGetMock = jest.fn((key: string) => Promise.resolve({}));
const mockGet = (
  preferences: Preferences
): (key: string) => Promise<object> => (key: string): Promise<object> => {
  if (key === 'preferences') {
    return Promise.resolve({ [key]: preferences });
  }
  throw new Error('Invalid key');
};

global.browser.storage.local.get = localGetMock;
global.browser.storage.local.set = localSetMock;

////////////////////////////////////////////////////////////
// Start tests

import { actions } from './Preferences';

describe('uses mocked browser.storage', () => {
  beforeEach(() => {
    localSetMock.mockClear();
    localGetMock.mockClear();
  });

  test('fetch(), empty', () => (
    actions.fetch().then((preferences) => {
      expect(Object.keys(preferences).length).toBe(1);
      expect(Object.keys(preferences.sites).length).toBe(0);
    })
  ));

  test('fetch(), no data', () => {
    localGetMock.mockImplementationOnce(mockGet({ sites: {} }));
    return actions.fetch().then((preferences) => {
      expect(Object.keys(preferences).length).toBe(1);
      expect(Object.keys(preferences.sites).length).toBe(0);
    });
  });

  test('fetch(), with data', () => {
    const mockPreferences: Preferences = {
      lastUsedSite: 'foo.example.com',
      sites: {
        'foo.example.com': {
          username: 'bob',
          loginType: 'yubikey',
        },
        'bar.example.com': {
          username: 'alice',
        },
        'zot.example.com': {
          loginType: 'totp',
        },
      },
    }
    localGetMock.mockImplementationOnce(mockGet(mockPreferences));
    return actions.fetch().then((preferences) => {
      expect(preferences).toEqual(mockPreferences);
    });
  });

  test('updateSitePreferences()', () => {
    const mockPreferences: Preferences = {
      lastUsedSite: 'bar.example.com',
      sites: {
        'foo.example.com': {
          username: 'bob',
          loginType: 'yubikey',
        },
        'bar.example.com': {
          username: 'alice',
          loginType: 'totp',
        },
      },
    }
    const host = 'foo.example.com';
    const username = 'eve';
    const loginType = 'totp';
    const newPreferences: Preferences = {
      ...mockPreferences,
      sites: {
        ...mockPreferences.sites,
        [host]: {
          username,
          loginType,
        },
      },
    }
    localGetMock.mockImplementationOnce(mockGet(mockPreferences));
    localGetMock.mockImplementationOnce(mockGet(newPreferences));
    return actions.updateSitePreferences(
      host, { username, loginType }
    ).then((preferences) => {
      expect(localSetMock).toHaveBeenCalledWith({
        preferences: newPreferences,
      });
      expect(preferences).toEqual(newPreferences);
    });
  });

  test('setLastUsedSite()', () => {
    const mockPreferences: Preferences = {
      lastUsedSite: 'bar.example.com',
      sites: {
        'foo.example.com': {
          username: 'bob',
          loginType: 'yubikey',
        },
        'bar.example.com': {
          username: 'alice',
          loginType: 'totp',
        },
      },
    }
    const host = 'foo.example.com';
    const newPreferences: Preferences = {
      ...mockPreferences,
      lastUsedSite: host,
    }
    localGetMock.mockImplementationOnce(mockGet(mockPreferences));
    localGetMock.mockImplementationOnce(mockGet(newPreferences));
    return actions.setLastUsedSite(host).then((preferences) => {
      expect(localSetMock).toHaveBeenCalledWith({
        preferences: newPreferences,
      });
      expect(preferences).toEqual(newPreferences);
    });
  });
});
