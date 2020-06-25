import '../../../__mocks__/browser'
import * as StoredSafe from '../StoredSafe'

/// /////////////////////////////////////////////////////////
// Set up mocks for browser storage API.

import * as sessions from './data/sessions'

const local = {
  sessions: sessions.sSessions
}

const localSetMock = jest.fn(async () => await Promise.resolve())
const localGetMock = jest.fn(async (key: 'sessions') => {
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

beforeEach(() => {
  localSetMock.mockClear()
  localGetMock.mockClear()
})

test('.login(), totp', async () => {
  const newSessions = await StoredSafe.actions.login(
    { host: 'login', apikey: 'apikey' },
    { ...loginFields, loginType: 'totp' }
  )
  expect(newSessions).toEqual(sessions.sessions)
  expect(localSetMock).toHaveBeenCalledWith({
    sessions: sessions.sLoginSessions
  })
})

test('.login(), totp with audit fields', async () => {
  const newSessions = await StoredSafe.actions.login(
    { host: 'audit', apikey: 'apikey' },
    { ...loginFields, loginType: 'totp' }
  )
  expect(newSessions).toEqual(sessions.sessions)
  expect(localSetMock).toHaveBeenCalledWith({
    sessions: sessions.sAuditSessions
  })
})

test('.login(), yubikey', async () => {
  const newSessions = await StoredSafe.actions.login(
    { host: 'login', apikey: 'apikey' },
    {
      ...loginFields,
      loginType: 'yubikey'
    }
  )
  expect(newSessions).toEqual(sessions.sessions)
  expect(localSetMock).toHaveBeenCalledWith({
    sessions: sessions.sLoginSessions
  })
})

test('.logout()', async () => {
  localGetMock.mockImplementationOnce(
    async (key: 'sessions') =>
      await Promise.resolve({
        [key]: sessions.sLoginSessions
      })
  )
  const newSessions = await StoredSafe.actions.logout('login')
  expect(newSessions).toEqual(sessions.sessions)
  expect(localSetMock).toHaveBeenCalledWith({
    sessions: sessions.sSessions
  })
})

test('.logout(), error', async () => {
  localGetMock.mockImplementationOnce(
    async (key: 'sessions') =>
      await Promise.resolve({
        [key]: sessions.sAuditSessions
      })
  )
  const newSessions = await StoredSafe.actions.logout('audit')
  expect(newSessions).toEqual(sessions.sessions)
  expect(localSetMock).toHaveBeenCalledWith({
    sessions: sessions.sSessions
  })
  expect(errorMock).toHaveBeenCalled()
})

test('.logoutAll(), error', async () => {
  localGetMock.mockImplementationOnce(
    async (key: 'sessions') =>
      await Promise.resolve({
        [key]: sessions.sLoginSessions
      })
  )
  const newSessions = await StoredSafe.actions.logoutAll()
  expect(newSessions).toEqual(sessions.sessions)
  expect(localSetMock).toHaveBeenCalledWith({ sessions: [] })
  expect(errorMock).toHaveBeenCalled()
})

test('.check()', async () => {
  await StoredSafe.actions.check('host')
  expect(localSetMock).not.toHaveBeenCalled()
})

test('.check(), invalid', async () => {
  localGetMock.mockImplementationOnce(
    async (key: 'sessions') =>
      await Promise.resolve({
        [key]: sessions.sAuditSessions
      })
  )
  await StoredSafe.actions.check('audit')
  expect(localSetMock).toHaveBeenCalledWith({
    sessions: sessions.sSessions
  })
})

test('.checkAll()', async () => {
  localGetMock.mockImplementation(
    async (key: 'sessions') =>
      await Promise.resolve({
        [key]: sessions.sAuditSessions
      })
  )
  await StoredSafe.actions.checkAll()
  expect(localSetMock).toHaveBeenCalledWith({
    sessions: sessions.sSessions
  })
})
