/// /////////////////////////////////////////////////////////
// Set up mocks for browser storage API.

import '../../__mocks__/browser'

/// /////////////////////////////////////////////////////////
// Start tests

import { actions } from './TabResults'
const localSetMock = jest.fn(() => Promise.resolve())
// eslint-disable-next-line
const localGetMock = jest.fn((key: string) => Promise.resolve({}));
const mockGet = (
  serializableTabresults: SerializableTabResults
): (key: string) => Promise<object> => (key: string): Promise<object> => {
  if (key === 'tabResults') {
    return Promise.resolve({ [key]: serializableTabresults })
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
    actions.fetch().then((tabResults) => {
      expect(tabResults.size).toBe(0)
    })
  ))

  test('fetch(), incomplete object', () => {
    localGetMock.mockImplementationOnce(mockGet([]))
    return actions.fetch().then((tabResults) => {
      expect(tabResults.size).toBe(0)
    })
  })

  test('fetch(), values exist', () => {
    const mockTabResults: SerializableTabResults = [
      [1, [['fetch.example.com', [{
        id: '1234',
        templateId: '4',
        vaultId: '5',
        name: 'Result',
        type: 'result',
        icon: 'ico_result',
        isDecrypted: false,
        fields: [{
          name: 'field',
          title: 'Field',
          value: 'field',
          isEncrypted: false,
          isShowing: false,
          isPassword: false
        }]
      }]]]]
    ]
    const parsedMockTabResults = new Map(mockTabResults.map(([k, v]) => [k, new Map(v)]))
    localGetMock.mockImplementationOnce(mockGet(mockTabResults))
    return actions.fetch().then((tabResults) => {
      expect(tabResults).toEqual(parsedMockTabResults)
    })
  })

  test('setTabResults()', () => {
    const tabId = 2
    const results: SerializableResults = [
      ['set.example.com', [{
        id: '7890',
        templateId: '4',
        vaultId: '5',
        name: 'Result',
        type: 'result',
        icon: 'ico_result',
        isDecrypted: false,
        fields: [{
          name: 'field',
          title: 'Field',
          value: 'field',
          isEncrypted: false,
          isShowing: false,
          isPassword: false
        }]
      }]]
    ]
    const newTabResults: SerializableTabResults = [
      [tabId, results]
    ]
    const parsedTabResults = new Map(newTabResults.map(([k, v]) => [k, new Map(v)]))
    localGetMock.mockImplementationOnce(mockGet([]))
    localGetMock.mockImplementationOnce(mockGet(newTabResults))
    return actions.setTabResults(
      tabId,
      new Map(results)
    ).then((tabResults) => {
      expect(localSetMock).toHaveBeenCalledWith({ tabResults: newTabResults })
      expect(tabResults).toEqual(parsedTabResults)
    })
  })

  test('clear()', () => {
    return actions.clear().then((tabResults) => {
      expect(localSetMock).toHaveBeenCalledWith({
        tabResults: []
      })
      expect(tabResults).toEqual(new Map([]))
    })
  })
})
