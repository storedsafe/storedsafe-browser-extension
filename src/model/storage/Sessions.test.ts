/// /////////////////////////////////////////////////////////
// Set up mocks for browser storage API.

import '../../__mocks__/browser'

/// /////////////////////////////////////////////////////////
// Start tests

import { actions } from './Sessions'
const localSetMock = jest.fn(() => Promise.resolve())
// eslint-disable-next-line
const localGetMock = jest.fn((key: string) => Promise.resolve({}));
const mockGet = (
  serializableSessions: SerializableSessions
): (key: string) => Promise<object> => (key: string): Promise<object> => {
  if (key === 'sessions') {
    return Promise.resolve({ [key]: serializableSessions })
  }
  throw new Error('Invalid key')
}

global.browser.storage.local.get = localGetMock
global.browser.storage.local.set = localSetMock

describe('uses mocked browser.storage', () => {
  beforeEach(() => {
    localSetMock.mockClear()
    localGetMock.mockClear()
  })

  test('fetch(), empty', () => (
    actions.fetch().then((sessions) => {
      expect(sessions.size).toBe(0)
    })
  ))

  test('fetch(), incomplete sessions object', () => {
    localGetMock.mockImplementationOnce(mockGet([]))
    return actions.fetch().then((sessions) => {
      expect(Object.keys(sessions).length).toBe(0)
    })
  })

  test('fetch(), values exist', () => {
    const mockSessions: SerializableSessions = [
      ['foo.example.com', {
        token: 'mocktoken',
        createdAt: 0,
        warnings: { key: 'warning' },
        violations: { key: 'error' },
        timeout: 0
      }]
    ]
    localGetMock.mockImplementationOnce(mockGet(mockSessions))
    return actions.fetch().then((sessions) => {
      expect(sessions).toEqual(new Map(mockSessions))
    })
  })

  test('add()', () => {
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
    return actions.add(host, session).then((sessions) => {
      expect(localSetMock).toHaveBeenCalledWith({
        sessions: newSessions
      })
      expect(sessions).toEqual(new Map(newSessions))
    })
  })

  test('remove()', () => {
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
    return actions.remove(host).then((sessions) => {
      expect(localSetMock).toHaveBeenCalledWith({
        sessions: []
      })
      expect(sessions).toEqual(new Map([]))
    })
  })

  test('clear()', () => {
    return actions.clear().then((sessions) => {
      expect(localSetMock).toHaveBeenCalledWith({
        sessions: []
      })
      expect(sessions).toEqual(new Map([]))
    })
  })
})
