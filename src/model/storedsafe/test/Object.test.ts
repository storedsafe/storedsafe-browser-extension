import '../../../__mocks__/browser'
import * as StoredSafe from '../StoredSafe'

/// /////////////////////////////////////////////////////////
// Set up mocks for browser storage API.

import * as find from './data/find'
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

/// /////////////////////////////////////////////////////////
// Start tests

beforeEach(() => {
  localSetMock.mockClear()
  localGetMock.mockClear()
  errorMock.mockClear()
})

test('.find()', async () => {
  const findResults = await StoredSafe.actions.find('host', 'server')
  expect(findResults).toEqual(find.results)
})

test('.find(), error', async () => {
  try {
    await StoredSafe.actions.find('error', 'server')
  } catch (error) {
    expect(error.message).toMatch('error')
  }
})

test('.decrypt()', async () => {
  const result = await StoredSafe.actions.decrypt('host', '1')
  expect(result).toEqual(find.decryptedResult)
})

test('.add()', async () => {
  await StoredSafe.actions.addObject('host', {})
})
