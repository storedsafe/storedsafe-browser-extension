/// /////////////////////////////////////////////////////////
// Set up mocks for browser storage API.

import '../../../__mocks__/browser'
import { actions } from '../Sessions'

const localSetMock = jest.fn(async () => await Promise.resolve())
const localGetMock = jest.fn(async (key: string) => await Promise.resolve({}))
const mockGet = (
  serializableSessions: SerializableSessions
): ((key: string) => Promise<object>) => async (
  key: string
): Promise<object> => {
  if (key === 'sessions') {
    return await Promise.resolve({ [key]: serializableSessions })
  }
  throw new Error('Invalid key')
}

global.browser.storage.local.get = localGetMock
global.browser.storage.local.set = localSetMock
const consoleError = global.console.error

/// /////////////////////////////////////////////////////////
// Start tests

describe('uses mocked browser.storage', () => {
  beforeEach(() => {
    localSetMock.mockClear()
    localGetMock.mockClear()
  })

  test('fetch(), empty', async () => {
    const sessions = await actions.fetch()
    expect(sessions.size).toBe(0)
  })

  test('fetch(), incomplete sessions object', async () => {
    localGetMock.mockImplementationOnce(mockGet([]))
    const sessions = await actions.fetch()
    expect(Object.keys(sessions).length).toBe(0)
  })

  test('fetch(), values exist', async () => {
    const mockSessions: SerializableSessions = [
      [
        'foo.example.com',
        {
          token: 'mocktoken',
          createdAt: 0,
          warnings: { key: 'warning' },
          violations: { key: 'error' },
          timeout: 0
        }
      ]
    ]
    localGetMock.mockImplementationOnce(mockGet(mockSessions))
    const sessions = await actions.fetch()
    expect(sessions).toEqual(new Map(mockSessions))
  })

  test('add()', async () => {
    const host = 'add.example.com'
    const session: Session = {
      token: 'addtoken',
      createdAt: 0,
      warnings: { key: 'warning' },
      violations: { key: 'error' },
      timeout: 0
    }
    const newSessions: SerializableSessions = [[host, session]]
    localGetMock.mockImplementationOnce(mockGet([]))
    localGetMock.mockImplementationOnce(mockGet(newSessions))
    const sessions = await actions.add(host, session)
    expect(localSetMock).toHaveBeenCalledWith({ sessions: newSessions })
    expect(sessions).toEqual(new Map(newSessions))
  })

  test('remove()', async () => {
    const host = 'remove.example.com'
    const session: Session = {
      token: 'removetoken',
      createdAt: 0,
      warnings: { key: 'warning' },
      violations: { key: 'error' },
      timeout: 0
    }
    const mockSessions: SerializableSessions = [[host, session]]
    localGetMock.mockImplementationOnce(mockGet(mockSessions))
    const sessions = await actions.remove(host)
    expect(localSetMock).toHaveBeenCalledWith({ sessions: [] })
    expect(sessions).toEqual(new Map())
  })

  test('clear()', async () => {
    const sessions = await actions.clear()
    expect(localSetMock).toHaveBeenCalledWith({
      sessions: []
    })
    expect(sessions).toEqual(new Map())
  })
})
