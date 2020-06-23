import '../../__mocks__/browser'

/// /////////////////////////////////////////////////////////
// Start tests

import * as StoredSafe from './StoredSafe'

/// /////////////////////////////////////////////////////////
// Set up mocks for browser storage API.

const results: Results = new Map<string, SSObject[]>([
  [
    'host',
    [
      {
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
            isPassword: false
          },
          {
            name: 'username',
            title: 'Username',
            value: 'Username',
            isEncrypted: false,
            isPassword: false
          },
          {
            name: 'password',
            title: 'Password',
            value: undefined,
            isEncrypted: true,
            isPassword: true
          }
        ]
      }
    ]
  ],
  ['other', []]
])
const serializableResults: SerializableResults = Array.from(results)

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
      isPassword: false
    },
    {
      name: 'username',
      title: 'Username',
      value: 'Username',
      isEncrypted: false,
      isPassword: false
    },
    {
      name: 'password',
      title: 'Password',
      value: 'Password',
      isEncrypted: true,
      isPassword: true
    }
  ]
}

const tabResults: TabResults = new Map([[1, results]])
const serializableTabResults = [[1, serializableResults]]

const sessions: Sessions = new Map([
  [
    'other',
    {
      apikey: 'abc123',
      token: 'token',
      createdAt: 1,
      warnings: {},
      violations: {},
      timeout: 14400000
    }
  ]
])
const serializableSessions: SerializableSessions = Array.from(sessions)

const mockSessions: Sessions = new Map([
  ...sessions,
  [
    'host',
    {
      token: 'token',
      createdAt: 0,
      warnings: {},
      violations: { key: 'violation' },
      timeout: 14400000
    }
  ]
])
const serializableMockSessions: SerializableSessions = Array.from(mockSessions)

const local = {
  sessions: serializableSessions,
  tabResults: serializableTabResults
}

const localSetMock = jest.fn(async () => await Promise.resolve())
const localGetMock = jest.fn(async (key: 'sessions' | 'tabResults') => {
  return await Promise.resolve({ [key]: local[key] })
})
const errorMock = jest.fn()

global.browser.storage.local.get = localGetMock
global.browser.storage.local.set = localSetMock
global.Date.now = jest.fn(() => 0)
global.console.error = errorMock
jest.mock('storedsafe')

const loginFields: TOTPFields & YubiKeyFields = {
  username: 'username',
  keys: 'passphraseoooooooooooooooooooooooooooooooooooooooooooo',
  passphrase: 'passphrase',
  otp: 'otp'
}

describe('Sessions', () => {
  beforeEach(() => {
    localSetMock.mockClear()
    localGetMock.mockClear()
  })

  test('.login(), totp', async () =>
    await StoredSafe.actions
      .login(
        { host: 'host', apikey: 'apikey' },
        { ...loginFields, loginType: 'totp' }
      )
      .then(newSessions => {
        expect(newSessions).toEqual(sessions)
        expect(localSetMock).toHaveBeenCalledWith({
          sessions: serializableMockSessions
        })
      }))

  test('.login(), yubikey', async () =>
    await StoredSafe.actions
      .login(
        { host: 'host', apikey: 'apikey' },
        {
          ...loginFields,
          loginType: 'yubikey'
        }
      )
      .then(newSessions => {
        expect(newSessions).toEqual(sessions)
        expect(localSetMock).toHaveBeenCalledWith({
          sessions: serializableMockSessions
        })
      }))

  test('.logout()', async () => {
    localGetMock.mockImplementationOnce(
      async (key: string) =>
        await Promise.resolve({
          [key]: serializableMockSessions
        })
    )
    return await StoredSafe.actions.logout('host').then(newSessions => {
      expect(newSessions).toEqual(sessions)
      expect(localSetMock).toHaveBeenCalledWith({
        sessions: serializableSessions
      })
    })
  })
})

describe('Search', () => {
  beforeEach(() => {
    localSetMock.mockClear()
    localGetMock.mockClear()
    errorMock.mockClear()
  })

  test('.find()', async () => {
    localGetMock.mockImplementation(
      async (key: string) =>
        await Promise.resolve({
          [key]: serializableMockSessions
        })
    )

    return await StoredSafe.actions.find('host', 'host').then(findResults => {
      expect(findResults).toEqual(results.get('host'))
    })
  })

  test('.find(), error', async () => {
    localGetMock.mockImplementationOnce(
      async (key: string) =>
        await Promise.resolve({
          [key]: serializableMockSessions
        })
    )

    return await StoredSafe.actions.find('other', 'host').catch(error => {
      expect(error.message).toMatch('StoredSafe Error')
    })
  })

  test('.decrypt()', async () => {
    localGetMock.mockImplementationOnce(
      async (key: string) =>
        await Promise.resolve({
          [key]: serializableMockSessions
        })
    )

    return await StoredSafe.actions.decrypt('host', '1').then(result => {
      expect(result).toEqual(decryptedResult)
    })
  })

  test('.tabFind()', async () => {
    localGetMock.mockImplementation(
      async () =>
        await Promise.resolve({
          ...local,
          sessions: serializableMockSessions
        })
    )

    return await StoredSafe.actions.tabFind(1, 'host').then(tabResults => {
      expect(tabResults.get(1)).toEqual(results)
      expect(errorMock).toHaveBeenCalledWith(expect.any(Error))
    })
  })
})
