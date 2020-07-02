import '../../../__mocks__/browser'
import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import { act, render, fireEvent, waitFor, screen } from '@testing-library/react'

import { useBlacklist } from '../useBlacklist'

/// /////////////////////////////////////////////////////////
// Set up mocks of external dependencies

const mockBlacklist: Blacklist = ['host']
const mockGet = jest.fn(
  async (key: string) =>
    await Promise.resolve({
      blacklist: mockBlacklist
    })
)
browser.storage.sync.get = mockGet

const mockAddBlacklist: Blacklist = ['add']

const mockSet = jest.fn(async () => await Promise.resolve())
browser.storage.sync.set = mockSet
const testError = jest.fn()

function manualGetMock (): {
  res: () => void
  rej: (reason?: any) => void
} {
  let res, rej
  const promise = new Promise<{ blacklist: Blacklist }>((resolve, reject) => {
    res = () => {
      resolve({ blacklist: mockBlacklist })
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

const BlacklistComponent: React.FunctionComponent = () => {
  const blacklist = useBlacklist()

  function handleAdd (): void {
    const host = mockAddBlacklist[0]
    blacklist.add(host).catch(error => {
      testError(error)
    })
  }

  function handleRemove (): void {
    blacklist.remove('host').catch(error => {
      testError(error)
    })
  }

  function handleFetch (): void {
    blacklist.fetch().catch(error => {
      testError(error)
    })
  }

  function handleClear (): void {
    blacklist.clear().catch(error => {
      testError(error)
    })
  }

  return (
    <section>
      <p data-testid='isInitialized'>
        {blacklist.isInitialized ? 'initialized' : 'waiting'}
      </p>
      <p data-testid='blacklist'>{JSON.stringify([...blacklist.blacklist])}</p>
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
test('useBlacklist(), test component', async () => {
  const { res } = manualGetMock()

  act(() => {
    render(<BlacklistComponent />)
  })

  const isInitialized = screen.getByTestId('isInitialized')
  const blacklist = screen.getByTestId('blacklist')

  // Before hook is initialized
  expect(isInitialized.innerHTML).toEqual('waiting')
  expect(blacklist.innerHTML).toEqual(JSON.stringify([...new Map()]))

  act(() => {
    res()
  })
  await waitFor(() => screen.getByText('initialized'))

  expect(mockGet).toHaveBeenCalledTimes(1)

  // After hook is intialized
  expect(mockGet).toHaveBeenCalledWith('blacklist')
  expect(isInitialized.innerHTML).toEqual('initialized')
  expect(blacklist.innerHTML).toEqual(JSON.stringify(mockBlacklist))

  // Test events
  fireEvent.click(screen.getByTestId('add'))
  await waitFor(() => expect(mockSet).toHaveBeenCalled())
  expect(mockSet).toHaveBeenCalledWith(
    expect.objectContaining({
      blacklist: [...mockBlacklist, ...mockAddBlacklist]
    })
  )

  fireEvent.click(screen.getByTestId('remove'))
  await waitFor(() => expect(mockSet).toHaveBeenCalled())
  expect(mockSet).toHaveBeenCalledWith(
    expect.objectContaining({
      blacklist: []
    })
  )

  fireEvent.click(screen.getByTestId('clear'))
  await waitFor(() => expect(mockSet).toHaveBeenCalled())
  expect(mockSet).toHaveBeenCalledWith(
    expect.objectContaining({
      blacklist: []
    })
  )

  mockGet.mockClear()
  fireEvent.click(screen.getByTestId('fetch'))
  await waitFor(() => {
    expect(mockGet).toHaveBeenCalled()
  })
  expect(mockGet).toHaveBeenNthCalledWith(1, 'blacklist')
})

/**
 * Test error handling
 */
test('useBlacklist(), fail init', async () => {
  const { rej } = manualGetMock()
  const spy = jest.spyOn(global.console, 'error').mockImplementation(() => {})

  act(() => {
    render(<BlacklistComponent />)
    rej('Sync Storage Error')
  })
  await waitFor(() => expect(spy).toHaveBeenCalled())
  expect(spy).toHaveBeenCalledWith('Sync Storage Error')
  spy.mockRestore()
})

/**
 * Test external updates
 */
type ChangeListener = (
  changes: { [key: string]: browser.storage.StorageChange },
  areaName: string
) => void

test('useBlacklist(), sync storage change', async () => {
  const listeners: ChangeListener[] = []
  browser.storage.onChanged.addListener = jest.fn(listener => {
    listeners.push(listener)
  })
  act(() => {
    render(<BlacklistComponent />)
  })

  await waitFor(() => screen.getByText('initialized'))

  act(() => {
    for (const listener of listeners) {
      listener(
        {
          blacklist: {
            newValue: [...mockBlacklist, ...mockAddBlacklist]
          }
        },
        'sync'
      )
    }
  })

  const blacklist = screen.getByTestId('blacklist')

  expect(blacklist.innerHTML).toEqual(
    JSON.stringify([...mockBlacklist, ...mockAddBlacklist])
  )
})

test('useBlacklist(), skip change', async () => {
  const listeners: ChangeListener[] = []
  browser.storage.onChanged.addListener = jest.fn(listener => {
    listeners.push(listener)
  })
  act(() => {
    render(<BlacklistComponent />)
  })

  await waitFor(() => screen.getByText('initialized'))

  const blacklist = screen.getByTestId('blacklist')

  // Local storage
  act(() => {
    for (const listener of listeners) {
      listener(
        {
          blacklist: {
            newValue: [...mockBlacklist, ...mockAddBlacklist]
          }
        },
        'local'
      )
    }
  })

  expect(blacklist.innerHTML).toEqual(JSON.stringify(mockBlacklist))

  // Managed storage
  act(() => {
    for (const listener of listeners) {
      listener(
        {
          blacklist: {
            newValue: [...mockBlacklist, ...mockAddBlacklist]
          }
        },
        'managed'
      )
    }
  })

  expect(blacklist.innerHTML).toEqual(JSON.stringify(mockBlacklist))

  // Wrong key
  act(() => {
    for (const listener of listeners) {
      listener(
        {
          notblacklist: {
            newValue: [...mockBlacklist, ...mockAddBlacklist]
          }
        },
        'sync'
      )
    }
  })
  expect(blacklist.innerHTML).toEqual(JSON.stringify(mockBlacklist))
})
