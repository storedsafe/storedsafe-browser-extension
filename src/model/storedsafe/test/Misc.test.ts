import '../../../__mocks__/browser'
import * as StoredSafe from '../StoredSafe'

/// /////////////////////////////////////////////////////////
// Set up mocks for browser storage API.

import * as sessions from './data/sessions'
import * as SiteInfo from './data/siteInfo'

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

/// /////////////////////////////////////////////////////////
// Start tests

beforeEach(() => {
  localSetMock.mockClear()
  localGetMock.mockClear()
})

test('getSiteInfo()', async () => {
  const siteInfo = await StoredSafe.actions.getSiteInfo('host')
  expect(siteInfo).toEqual(SiteInfo.siteInfo)
})

test('getSiteInfo()', async () => {
  localGetMock.mockImplementationOnce(
    async (key: 'sessions') =>
      await Promise.resolve({
        [key]: sessions.sAuditSessions
      })
  )
  const siteInfo = await StoredSafe.actions.getSiteInfo('audit')
  expect(siteInfo).toEqual(SiteInfo.siteInfoNoVaults)
})

test('generatePassword()', async () => {
  const password = await StoredSafe.actions.generatePassword('host')
  expect(password).toEqual('password')
})
