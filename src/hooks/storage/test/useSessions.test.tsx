import '../../../__mocks__/browser'
import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import { act, render, fireEvent, waitFor, screen } from '@testing-library/react'

import { useSessions } from '../useSessions'

/// /////////////////////////////////////////////////////////
// Set up mocks of external dependencies

const mockSessions: Sessions = new Map([
  [
    'host',
    {
      token: 'token',
      createdAt: 0,
      violations: {},
      warnings: {},
      timeout: 36e5
    }
  ]
])
const mockGet = jest.fn(
  async (key: string) =>
    await Promise.resolve({
      sessions: mockSessions
    })
)
browser.storage.local.get = mockGet

const mockAddSessions: Sessions = new Map([
  [
    'add_host',
    {
      token: 'add_token',
      createdAt: 1,
      violations: {},
      warnings: {},
      timeout: 144e5
    }
  ]
])

const mockSet = jest.fn(async () => await Promise.resolve())
browser.storage.local.set = mockSet
const testError = jest.fn()

function manualGetMock (): {
  res: () => void
  rej: (reason?: any) => void
} {
  let res, rej
  const promise = new Promise<{ sessions: Sessions }>((resolve, reject) => {
    res = () => {
      resolve({ sessions: mockSessions })
    }
    rej = (reason?: any) => {
      reject(reason)
    }
  })

  mockGet.mockImplementationOnce(async (key: string) => await promise)
  return { res, rej }
}

/// /////////////////////////////////////////////////////////
// Set up React component for testing hook in.

const SessionsComponent: React.FunctionComponent = () => {
  const sessions = useSessions()

  function handleAdd (): void {
    const [host, session] = [...mockAddSessions][0]
    sessions.add(host, session).catch(error => {
      testError(error)
    })
  }

  function handleRemove (): void {
    sessions.remove('host').catch(error => {
      testError(error)
    })
  }

  function handleFetch (): void {
    sessions.fetch().catch(error => {
      testError(error)
    })
  }

  function handleClear (): void {
    sessions.clear().catch(error => {
      testError(error)
    })
  }

  return (
    <section>
      <p data-testid='isInitialized'>
        {sessions.isInitialized ? 'initialized' : 'waiting'}
      </p>
      <p data-testid='sessions'>{JSON.stringify([...sessions.sessions])}</p>
      <p data-testid='online'>{sessions.isOnline.toString()}</p>
      <p data-testid='number'>{sessions.numberOfSessions}</p>
      <button data-testid='add' onClick={handleAdd} />
      <button data-testid='remove' onClick={handleRemove} />
      <button data-testid='fetch' onClick={handleFetch} />
      <button data-testid='clear' onClick={handleClear} />
    </section>
  )
}

/// /////////////////////////////////////////////////////////
// Run tests

beforeEach(() => {
  mockGet.mockClear()
  mockSet.mockClear()
})

/**
 * Comprehensive state test
 */
test('useSessions(), test component', async () => {
  const { res } = manualGetMock()

  act(() => {
    render(<SessionsComponent />)
  })

  const isInitialized = screen.getByTestId('isInitialized')
  const sessions = screen.getByTestId('sessions')
  const online = screen.getByTestId('online')
  const num = screen.getByTestId('number')

  // Before hook is initialized
  expect(isInitialized.innerHTML).toEqual('waiting')
  expect(sessions.innerHTML).toEqual(JSON.stringify([...new Map()]))
  expect(online.innerHTML).toEqual('false')
  expect(num.innerHTML).toEqual('0')

  act(() => {
    res()
  })
  await waitFor(() => screen.getByText('initialized'))

  expect(mockGet).toHaveBeenCalledTimes(1)

  // After hook is intialized
  expect(mockGet).toHaveBeenCalledWith('sessions')
  expect(isInitialized.innerHTML).toEqual('initialized')
  expect(sessions.innerHTML).toEqual(JSON.stringify([...mockSessions]))
  expect(online.innerHTML).toEqual('true')
  expect(num.innerHTML).toEqual('1')

  // Test events
  fireEvent.click(screen.getByTestId('add'))
  await waitFor(() =>
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        sessions: [...mockSessions, ...mockAddSessions]
      })
    )
  )

  fireEvent.click(screen.getByTestId('remove'))
  await waitFor(() =>
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        sessions: []
      })
    )
  )

  fireEvent.click(screen.getByTestId('clear'))
  await waitFor(() =>
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        sessions: []
      })
    )
  )

  mockGet.mockClear()
  fireEvent.click(screen.getByTestId('fetch'))
  await waitFor(() => {
    expect(mockGet).toHaveBeenNthCalledWith(1, 'sessions')
  })
})

/**
 * Test error handling
 */
test('useSessions(), fail init', async () => {
  const { rej } = manualGetMock()
  const spy = jest.spyOn(global.console, 'error').mockImplementation(() => {})

  act(() => {
    render(<SessionsComponent />)
    rej('Local Storage Error')
  })
  await waitFor(() => expect(spy).toHaveBeenCalled())
  expect(spy).toHaveBeenCalledWith('Local Storage Error')
  spy.mockRestore()
})

/**
 * Test external updates
 */
type ChangeListener = (
  changes: { [key: string]: browser.storage.StorageChange },
  areaName: string
) => void

test('useSessions(), local storage change', async () => {
  const listeners: ChangeListener[] = []
  browser.storage.onChanged.addListener = jest.fn(listener => {
    listeners.push(listener)
  })
  act(() => {
    render(<SessionsComponent />)
  })

  await waitFor(() => screen.getByText('initialized'))

  act(() => {
    for (const listener of listeners) {
      listener(
        {
          sessions: {
            newValue: [...mockSessions, ...mockAddSessions]
          }
        },
        'local'
      )
    }
  })

  const sessions = screen.getByTestId('sessions')
  const online = screen.getByTestId('online')
  const num = screen.getByTestId('number')

  // Before hook is initialized
  expect(sessions.innerHTML).toEqual(
    JSON.stringify([...mockSessions, ...mockAddSessions])
  )
  expect(online.innerHTML).toEqual('true')
  expect(num.innerHTML).toEqual('2')
})

test('useSessions(), skip change', async () => {
  const listeners: ChangeListener[] = []
  browser.storage.onChanged.addListener = jest.fn(listener => {
    listeners.push(listener)
  })
  act(() => {
    render(<SessionsComponent />)
  })

  await waitFor(() => screen.getByText('initialized'))

  const sessions = screen.getByTestId('sessions')
  const online = screen.getByTestId('online')
  const num = screen.getByTestId('number')

  // Sync storage
  act(() => {
    for (const listener of listeners) {
      listener(
        {
          sessions: {
            newValue: [...mockSessions, ...mockAddSessions]
          }
        },
        'sync'
      )
    }
  })

  expect(sessions.innerHTML).toEqual(JSON.stringify([...mockSessions]))
  expect(online.innerHTML).toEqual('true')
  expect(num.innerHTML).toEqual('1')

  // Managed storage
  act(() => {
    for (const listener of listeners) {
      listener(
        {
          sessions: {
            newValue: [...mockSessions, ...mockAddSessions]
          }
        },
        'managed'
      )
    }
  })

  expect(sessions.innerHTML).toEqual(JSON.stringify([...mockSessions]))
  expect(online.innerHTML).toEqual('true')
  expect(num.innerHTML).toEqual('1')

  // Wrong key
  act(() => {
    for (const listener of listeners) {
      listener(
        {
          notsessions: {
            newValue: [...mockSessions, ...mockAddSessions]
          }
        },
        'local'
      )
    }
  })
  expect(sessions.innerHTML).toEqual(JSON.stringify([...mockSessions]))
  expect(online.innerHTML).toEqual('true')
  expect(num.innerHTML).toEqual('1')
})
