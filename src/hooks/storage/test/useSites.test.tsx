import '../../../__mocks__/browser'
import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import { act, render, fireEvent, waitFor, screen } from '@testing-library/react'

import { useSites } from '../useSites'

/// /////////////////////////////////////////////////////////
// Set up mocks of external dependencies

const userMockSites: Site[] = [{ host: 'user_host', apikey: 'user_apikey' }]
const mockGetSync = jest.fn(
  async (key: string) =>
    await Promise.resolve({
      sites: userMockSites
    })
)
browser.storage.sync.get = mockGetSync

const mockSetSync = jest.fn(async () => await Promise.resolve())
browser.storage.sync.set = mockSetSync

const systemMockSites: Site[] = [
  { host: 'system_host', apikey: 'system_apikey' }
]
const mockGetManaged = jest.fn(
  async (key: string) =>
    await Promise.resolve({
      sites: systemMockSites
    })
)
browser.storage.managed.get = mockGetManaged

const testError = jest.fn()

function manualGetMock (): {
  resSync: () => void
  rejSync: (reason?: any) => void
  resManaged: () => void
  rejManaged: (reason?: any) => void
} {
  let resSync, rejSync, resManaged, rejManaged
  const syncPromise = new Promise<{ sites: Site[] }>((resolve, reject) => {
    resSync = () => resolve({ sites: userMockSites })
    rejSync = (reason?: any) => reject(reason)
  })
  const managedPromise = new Promise<{ sites: Site[] }>((resolve, reject) => {
    resManaged = () => resolve({ sites: systemMockSites })
    rejManaged = (reason?: any) => reject(reason)
  })

  mockGetSync.mockImplementationOnce(async (key: string) => await syncPromise)
  mockGetManaged.mockImplementationOnce(
    async (key: string) => await managedPromise
  )

  return { resSync, rejSync, resManaged, rejManaged }
}

/// /////////////////////////////////////////////////////////
// Set up React component for testing hook in.

const SitesComponent: React.FunctionComponent = () => {
  const sites = useSites()

  function handleAdd (): void {
    sites
      .add({
        apikey: 'add_apikey',
        host: 'add_host'
      })
      .catch(error => {
        testError(error)
      })
  }

  function handleRemove (): void {
    sites.remove(0).catch(error => {
      testError(error)
    })
  }

  function handleFetch (): void {
    sites.fetch().catch(error => {
      testError(error)
    })
  }

  return (
    <section>
      <p data-testid='isInitialized'>{sites.isInitialized.toString()}</p>
      <p data-testid='sites'>{JSON.stringify(sites.all)}</p>
      <p data-testid='system'>{JSON.stringify(sites.system)}</p>
      <p data-testid='user'>{JSON.stringify(sites.user)}</p>
      <button data-testid='add' onClick={handleAdd} />
      <button data-testid='remove' onClick={handleRemove} />
      <button data-testid='fetch' onClick={handleFetch} />
    </section>
  )
}

/// /////////////////////////////////////////////////////////
// Run tests

beforeEach(() => {
  mockGetSync.mockClear()
  mockGetManaged.mockClear()
  mockSetSync.mockClear()
})

/**
 * Comprehensive state test
 */
test('useSites()', async () => {
  const { resSync, resManaged } = manualGetMock()

  act(() => {
    render(<SitesComponent />)
  })
  const isInitialized = screen.getByTestId('isInitialized')
  const sites = screen.getByTestId('sites')
  const system = screen.getByTestId('system')
  const user = screen.getByTestId('user')

  // Before hook is initialized
  expect(isInitialized.innerHTML).toEqual('false')
  expect(sites.innerHTML).toEqual(JSON.stringify([]))
  expect(system.innerHTML).toEqual(JSON.stringify([]))
  expect(user.innerHTML).toEqual(JSON.stringify([]))

  act(() => {
    resSync()
    resManaged()
  })
  await waitFor(() => screen.getByText('true'))

  // After hook is intialized
  expect(mockGetSync).toHaveBeenCalledWith('sites')
  expect(mockGetManaged).toHaveBeenCalledWith('sites')
  expect(isInitialized.innerHTML).toEqual('true')
  expect(sites.innerHTML).toEqual(
    JSON.stringify([...systemMockSites, ...userMockSites])
  )
  expect(system.innerHTML).toEqual(JSON.stringify(systemMockSites))
  expect(user.innerHTML).toEqual(JSON.stringify(userMockSites))

  // Test events
  fireEvent.click(screen.getByTestId('add'))
  await waitFor(() => expect(mockSetSync).toHaveBeenCalled())
  expect(mockSetSync).toHaveBeenCalledWith(
    expect.objectContaining({
      sites: [...userMockSites, { host: 'add_host', apikey: 'add_apikey' }]
    })
  )

  fireEvent.click(screen.getByTestId('remove'))
  await waitFor(() => expect(mockSetSync).toHaveBeenCalled())
  expect(mockSetSync).toHaveBeenCalledWith(
    expect.objectContaining({
      sites: []
    })
  )

  mockGetManaged.mockClear()
  mockGetSync.mockClear()
  fireEvent.click(screen.getByTestId('fetch'))
  await waitFor(() => {
    expect(mockGetSync).toHaveBeenCalled()
    expect(mockGetManaged).toHaveBeenCalled()
  })
  expect(mockGetSync).toHaveBeenNthCalledWith(1, 'sites')
  expect(mockGetManaged).toHaveBeenNthCalledWith(1, 'sites')
})

/**
 * Test error handling
 */
test('useSites(), fail sync init', async () => {
  const { rejSync, resManaged } = manualGetMock()
  const spy = jest.spyOn(global.console, 'error').mockImplementation(() => {})

  act(() => {
    render(<SitesComponent />)
    rejSync('Sync Storage Error')
    resManaged()
  })
  await waitFor(() => expect(spy).toHaveBeenCalled())
  expect(spy).toHaveBeenCalledWith('Sync Storage Error')
  spy.mockRestore()
})

test('useSites(), fail managed init', async () => {
  const { rejManaged, resSync } = manualGetMock()
  const spy = jest.spyOn(global.console, 'error').mockImplementation(() => {})

  act(() => {
    render(<SitesComponent />)
    rejManaged('Managed Storage Error')
    resSync()
  })
  await waitFor(() => expect(spy).toHaveBeenCalled())
  expect(spy).toHaveBeenCalledWith('Managed Storage Error')
  spy.mockRestore()
})

/**
 * Test external updates
 */
type ChangeListener = (
  changes: { [key: string]: browser.storage.StorageChange },
  areaName: string
) => void

test('useSites(), sync storage change', async () => {
  const listeners: ChangeListener[] = []
  browser.storage.onChanged.addListener = jest.fn(listener => {
    listeners.push(listener)
  })
  act(() => {
    render(<SitesComponent />)
  })

  await waitFor(() => screen.getByText('true'))

  act(() => {
    for (const listener of listeners) {
      listener(
        {
          sites: {
            newValue: [
              ...userMockSites,
              { host: 'update_host', apikey: 'update_apikey' }
            ]
          }
        },
        'sync'
      )
    }
  })

  const system = screen.getByTestId('system')
  const user = screen.getByTestId('user')

  expect(system.innerHTML).toEqual(JSON.stringify(systemMockSites))
  expect(user.innerHTML).toEqual(
    JSON.stringify([
      ...userMockSites,
      { host: 'update_host', apikey: 'update_apikey' }
    ])
  )
})

test('useSites(), sync storage change', async () => {
  const listeners: ChangeListener[] = []
  browser.storage.onChanged.addListener = jest.fn(listener => {
    listeners.push(listener)
  })
  act(() => {
    render(<SitesComponent />)
  })

  await waitFor(() => screen.getByText('true'))

  act(() => {
    for (const listener of listeners) {
      listener(
        {
          sites: {
            newValue: [
              ...systemMockSites,
              { host: 'update_host', apikey: 'update_apikey' }
            ]
          }
        },
        'managed'
      )
    }
  })

  const system = screen.getByTestId('system')
  const user = screen.getByTestId('user')

  expect(system.innerHTML).toEqual(
    JSON.stringify([
      ...systemMockSites,
      { host: 'update_host', apikey: 'update_apikey' }
    ])
  )
  expect(user.innerHTML).toEqual(JSON.stringify(userMockSites))
})

test('useSites(), skip change', async () => {
  const listeners: ChangeListener[] = []
  browser.storage.onChanged.addListener = jest.fn(listener => {
    listeners.push(listener)
  })
  act(() => {
    render(<SitesComponent />)
  })

  await waitFor(() => screen.getByText('true'))

  // Local storage
  act(() => {
    for (const listener of listeners) {
      listener(
        {
          sites: {
            newValue: [
              ...systemMockSites,
              { host: 'update_host', apikey: 'update_apikey' }
            ]
          }
        },
        'local'
      )
    }
  })

  const system = screen.getByTestId('system')
  const user = screen.getByTestId('user')

  expect(system.innerHTML).toEqual(JSON.stringify([...systemMockSites]))
  expect(user.innerHTML).toEqual(JSON.stringify(userMockSites))

  // Sync, wrong key
  act(() => {
    for (const listener of listeners) {
      listener(
        {
          notsites: {
            newValue: [
              ...systemMockSites,
              { host: 'update_host', apikey: 'update_apikey' }
            ]
          }
        },
        'sync'
      )
    }
  })
  expect(system.innerHTML).toEqual(JSON.stringify([...systemMockSites]))
  expect(user.innerHTML).toEqual(JSON.stringify(userMockSites))

  // Managed, wrong key
  act(() => {
    for (const listener of listeners) {
      listener(
        {
          notsites: {
            newValue: [
              ...systemMockSites,
              { host: 'update_host', apikey: 'update_apikey' }
            ]
          }
        },
        'managed'
      )
    }
  })
  expect(system.innerHTML).toEqual(JSON.stringify([...systemMockSites]))
  expect(user.innerHTML).toEqual(JSON.stringify(userMockSites))
})
