const localSetMock = jest.fn(() => Promise.resolve());
//eslint-disable-next-line
const localGetMock = jest.fn((key: string) => Promise.resolve({}));
const mockGet = (
  values: object
): (key: string) => Promise<object> => (key: string): Promise<object> => {
  if (key === 'sitePrefs') {
    return Promise.resolve({ [key]: values });
  }
  throw new Error('Invalid key');
};

global.browser = {
  storage: {
    local:  {
      get: localGetMock,
      set: localSetMock,
    },
  }
};

import * as SitePrefs from './SitePrefs';

describe('uses mocked browser.storage', () => {
  beforeEach(() => {
    localSetMock.mockClear();
    localGetMock.mockClear();
  });

  test('fetch(), empty', () => (
    SitePrefs.actions.fetch().then((sitePrefs) => {
      expect(Object.keys(sitePrefs).length).toBe(0);
    })
  ));

  test('fetch(), no data', () => {
    localGetMock.mockImplementationOnce(mockGet({}));
    return SitePrefs.actions.fetch().then((sitePrefs) => {
      expect(Object.keys(sitePrefs).length).toBe(0);
    });
  });

  test('fetch(), with data', () => {
    const mockSitePrefs: SitePrefs.SitePrefs = {
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
    }
    localGetMock.mockImplementationOnce(mockGet(mockSitePrefs));
    return SitePrefs.actions.fetch().then((sitePrefs) => {
      expect(sitePrefs['foo.example.com']).toBe(mockSitePrefs['foo.example.com']);
      expect(sitePrefs['bar.example.com']).toBe(mockSitePrefs['bar.example.com']);
      expect(sitePrefs['zot.example.com']).toBe(mockSitePrefs['zot.example.com']);
    });
  });

  test('update()', () => {
    const mockSitePrefs: SitePrefs.SitePrefs = {
      'foo.example.com': {
        username: 'bob',
        loginType: 'yubikey',
      },
    }
    const url = 'foo.example.com';
    const username = 'eve';
    const loginType = 'totp';
    const newSitePrefs: SitePrefs.SitePrefs = {
      ...mockSitePrefs,
      [url]: {
        username,
        loginType,
      },
    }
    localGetMock.mockImplementationOnce(mockGet(mockSitePrefs));
    localGetMock.mockImplementationOnce(mockGet(newSitePrefs));
    return SitePrefs.actions.update(
      url, username, loginType
    ).then((sitePrefs) => {
      expect(localSetMock).toHaveBeenCalledWith({
        sitePrefs: newSitePrefs,
      });
      expect(sitePrefs).toEqual(newSitePrefs);
    });
  });

  test('remove()', () => {
    const mockSitePrefs: SitePrefs.SitePrefs = {
      'foo.example.com': {
        username: 'bob',
        loginType: 'yubikey',
      },
    }
    localGetMock.mockImplementationOnce(mockGet(mockSitePrefs));
    const url = 'foo.example.com';
    return SitePrefs.actions.remove(url).then((sitePrefs) => {
      expect(localSetMock).toHaveBeenCalledWith({ sitePrefs: {} });
      expect(sitePrefs).toEqual({});
    });
  });
});
