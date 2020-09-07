/// /////////////////////////////////////////////////////////
// Set up mocks for browser storage API.

import '../../../__mocks__/browser'
import { actions } from '../Preferences'

const localSetMock = jest.fn(async () => await Promise.resolve())
// eslint-disable-next-line
const localGetMock = jest.fn((key: string) => Promise.resolve({}))
const mockGet = (
  preferences: Preferences
): ((key: string) => Promise<object>) => async (
  key: string
): Promise<object> => {
  if (key === 'preferences') {
    return await Promise.resolve({ [key]: preferences })
  }
  throw new Error('Invalid key')
}

global.browser.storage.local.get = localGetMock
global.browser.storage.local.set = localSetMock

/// /////////////////////////////////////////////////////////
// Start tests

describe('uses mocked browser.storage', () => {
  beforeEach(() => {
    localSetMock.mockClear()
    localGetMock.mockClear()
  })

  test('fetch(), empty', async () => {
    const preferences = await actions.fetch()
    expect(Object.keys(preferences).length).toBe(1)
    expect(Object.keys(preferences.sites).length).toBe(0)
  })

  test('fetch(), no data', async () => {
    localGetMock.mockImplementationOnce(mockGet({ sites: {} }))
    const preferences = await actions.fetch()
    expect(Object.keys(preferences).length).toBe(1)
    expect(Object.keys(preferences.sites).length).toBe(0)
  })

  test('fetch(), with data', async () => {
    const mockPreferences: Preferences = {
      lastUsedSite: 'foo.example.com',
      sites: {
        'foo.example.com': {
          username: 'bob',
          loginType: 'yubikey'
        },
        'bar.example.com': {
          username: 'alice'
        },
        'zot.example.com': {
          loginType: 'totp'
        }
      }
    }
    localGetMock.mockImplementationOnce(mockGet(mockPreferences))
    const preferences = await actions.fetch()
    expect(preferences).toEqual(mockPreferences)
  })

  test('updateSitePreferences()', async () => {
    const mockPreferences: Preferences = {
      lastUsedSite: 'bar.example.com',
      sites: {
        'foo.example.com': {
          username: 'bob',
          loginType: 'yubikey'
        },
        'bar.example.com': {
          username: 'alice',
          loginType: 'totp'
        }
      }
    }
    const host = 'foo.example.com'
    const username = 'eve'
    const loginType = 'totp'
    const newPreferences: Preferences = {
      ...mockPreferences,
      sites: {
        ...mockPreferences.sites,
        [host]: {
          username,
          loginType
        }
      }
    }
    localGetMock.mockImplementationOnce(mockGet(mockPreferences))
    localGetMock.mockImplementationOnce(mockGet(newPreferences))
    const preferences = await actions.updateSitePreferences(host, {
      username,
      loginType
    })
    expect(localSetMock).toHaveBeenCalledWith({
      preferences: newPreferences
    })
    expect(preferences).toEqual(newPreferences)
  })

  test('setLastUsedSite()', async () => {
    const mockPreferences: Preferences = {
      lastUsedSite: 'bar.example.com',
      sites: {
        'foo.example.com': {
          username: 'bob',
          loginType: 'yubikey'
        },
        'bar.example.com': {
          username: 'alice',
          loginType: 'totp'
        }
      }
    }
    const host = 'foo.example.com'
    const newPreferences: Preferences = {
      ...mockPreferences,
      lastUsedSite: host
    }
    localGetMock.mockImplementationOnce(mockGet(mockPreferences))
    localGetMock.mockImplementationOnce(mockGet(newPreferences))
    const preferences = await actions.setLastUsedSite(host)
    expect(localSetMock).toHaveBeenCalledWith({
      preferences: newPreferences
    })
    expect(preferences).toEqual(newPreferences)
  })

  test('setLastUsedResult(), preference exists', async () => {
    const url = 'my.site.com'
    const host = 'bar.example.com'
    const objectId = '3'
    const mockPreferences: Preferences = {
      lastUsedResults: [
        [url, { host: 'foo.example.com', objectId: '2' }],
        ['other.site.com', { host: 'bar.example.com', objectId: '3' }]
      ],
      lastUsedSite: 'bar.example.com',
      sites: {
        'foo.example.com': {
          username: 'bob',
          loginType: 'yubikey'
        },
        'bar.example.com': {
          username: 'alice',
          loginType: 'totp'
        }
      }
    }
    const newPreferences: Preferences = {
      ...mockPreferences,
      lastUsedResults: [
        ...new Map([
          ...mockPreferences.lastUsedResults,
          [url, { host, objectId }]
        ])
      ]
    }
    localGetMock.mockImplementationOnce(mockGet(mockPreferences))
    localGetMock.mockImplementationOnce(mockGet(newPreferences))
    const preferences = await actions.setLastUsedResult(url, host, objectId)
    expect(localSetMock).toHaveBeenCalledWith({
      preferences: newPreferences
    })
    expect(preferences).toEqual(newPreferences)
  })

  test('clear()', async () => {
    const preferences = await actions.clear()
    expect(preferences).toEqual({ sites: {} })
  })

  test('fetch(), storage unavailable', async () => {
    localGetMock.mockImplementationOnce(() => {
      throw new Error()
    })
    await expect(actions.fetch()).rejects.toThrowError()
  })

  test('setLastUsedSite(), storage unavailable', async () => {
    localGetMock.mockImplementationOnce(() => {
      throw new Error()
    })
    localSetMock.mockImplementationOnce(() => {
      throw new Error()
    })
    await expect(actions.setLastUsedSite('host')).rejects.toThrowError()
  })
})
