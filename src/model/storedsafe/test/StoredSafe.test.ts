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
})

test('.check(), server error', async () => {
  localGetMock.mockImplementationOnce(async (key: 'sessions') => ({
    [key]: [
      [
        'host',
        {
          apikey: 'apikey',
          token: '500',
          createdAt: 0,
          warnings: {},
          violations: {},
          timeout: 36000
        }
      ]
    ]
  }))
  expect.assertions(1)
  try {
    await StoredSafe.actions.check('host')
  } catch (error) {
    expect((error as Error).message).toMatch('Network')
  }
})

test('.check(), request error', async () => {
  localGetMock.mockImplementationOnce(async (key: 'sessions') => ({
    [key]: [
      [
        'host',
        {
          apikey: 'apikey',
          token: 'error',
          createdAt: 0,
          warnings: {},
          violations: {},
          timeout: 36000
        }
      ]
    ]
  }))
  expect.assertions(1)
  try {
    await StoredSafe.actions.check('host')
  } catch (error) {
    expect((error as Error).message).toMatch('Unexpected')
  }
})