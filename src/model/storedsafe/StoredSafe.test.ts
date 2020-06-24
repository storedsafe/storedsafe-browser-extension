import '../../__mocks__/browser'
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
  ['host1', []],
  ['host2', []]
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

// const tabResults: TabResults = new Map([[1, results]])
const serializableTabResults = [[1, serializableResults]]

const sessions: Sessions = new Map([
  [
    'host1',
    {
      apikey: 'abc123',
      token: 'token',
      createdAt: 1,
      warnings: { key: 'warning' },
      violations: {},
      timeout: 14400000
    }
  ],
  [
    'host2',
    {
      apikey: 'abc123',
      token: 'token',
      createdAt: 1,
      warnings: { key: 'warning' },
      violations: {},
      timeout: 36000
    }
  ]
])
const serializableSessions: SerializableSessions = Array.from(sessions)

const hostSessions: Sessions = new Map([
  ...sessions,
  [
    'host',
    {
      token: 'token',
      createdAt: 0,
      warnings: {},
      violations: {},
      timeout: 14400000
    }
  ]
])
const serializableHostSessions: SerializableSessions = Array.from(hostSessions)

const warningSessions: Sessions = new Map([
  ...sessions,
  [
    'warning',
    {
      token: 'token',
      createdAt: 0,
      warnings: { key: 'warning' },
      violations: { key: 'violation' },
      timeout: 14400000
    }
  ]
])
const serializableWarningSessions: SerializableSessions = Array.from(
  warningSessions
)

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

/// /////////////////////////////////////////////////////////
// Start tests

describe('Sessions', () => {
  beforeEach(() => {
    localSetMock.mockClear()
    localGetMock.mockClear()
  })

  test('.login(), totp', async () => {
    const newSessions = await StoredSafe.actions.login(
      { host: 'host', apikey: 'apikey' },
      { ...loginFields, loginType: 'totp' }
    )
    expect(newSessions).toEqual(sessions)
    expect(localSetMock).toHaveBeenCalledWith({
      sessions: serializableHostSessions
    })
  })

  test('.login(), totp with warnings', async () => {
    const newSessions = await StoredSafe.actions.login(
      { host: 'warning', apikey: 'apikey' },
      { ...loginFields, loginType: 'totp' }
    )
    expect(newSessions).toEqual(sessions)
    expect(localSetMock).toHaveBeenCalledWith({
      sessions: serializableWarningSessions
    })
  })

  test('.login(), yubikey', async () => {
    const newSessions = await StoredSafe.actions.login(
      { host: 'host', apikey: 'apikey' },
      {
        ...loginFields,
        loginType: 'yubikey'
      }
    )
    expect(newSessions).toEqual(sessions)
    expect(localSetMock).toHaveBeenCalledWith({
      sessions: serializableHostSessions
    })
  })

  test('.logout()', async () => {
    localGetMock.mockImplementationOnce(
      async (key: string) =>
        await Promise.resolve({
          [key]: serializableHostSessions
        })
    )
    const newSessions = await StoredSafe.actions.logout('host')
    expect(newSessions).toEqual(sessions)
    expect(localSetMock).toHaveBeenCalledWith({
      sessions: serializableSessions
    })
  })

  test('.check()', async () => {
    await StoredSafe.actions.check('host1')
    expect(localSetMock).not.toHaveBeenCalled()
  })

  test('.check(), invalid', async () => {
    const newSerializableSessions: SerializableSessions = [
      serializableSessions[0]
    ]
    await StoredSafe.actions.check('host2')
    expect(localSetMock).toHaveBeenCalledWith({
      sessions: newSerializableSessions
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
          [key]: serializableHostSessions
        })
    )

    const findResults = await StoredSafe.actions.find('host', 'host')
    expect(findResults).toEqual(results.get('host'))
  })

  test('.find(), error', async () => {
    localGetMock.mockImplementationOnce(
      async (key: string) =>
        await Promise.resolve({
          [key]: serializableHostSessions
        })
    )

    try {
      await StoredSafe.actions.find('host1', 'host')
    } catch (error) {
      expect(error.message).toMatch('StoredSafe Error')
    }
  })

  test('.decrypt()', async () => {
    localGetMock.mockImplementationOnce(
      async (key: string) =>
        await Promise.resolve({
          [key]: serializableHostSessions
        })
    )

    const result = await StoredSafe.actions.decrypt('host', '1')
    expect(result).toEqual(decryptedResult)
  })

  test('.tabFind()', async () => {
    localGetMock.mockImplementation(
      async () =>
        await Promise.resolve({
          ...local,
          sessions: serializableHostSessions
        })
    )

    const tabResults = await StoredSafe.actions.tabFind(1, 'host')
    expect(tabResults.get(1)).toEqual(results)
    expect(errorMock).toHaveBeenCalledWith(expect.any(Error))
  })
})
