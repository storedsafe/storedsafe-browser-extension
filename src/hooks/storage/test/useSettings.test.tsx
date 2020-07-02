import '../../../__mocks__/browser'
import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import { act, render, fireEvent, waitFor, screen } from '@testing-library/react'

import { defaults, merge } from '../../../model/storage/Settings'
import { useSettings } from '../useSettings'

/// /////////////////////////////////////////////////////////
// Set up mocks of external dependencies

type StorageSettings = Record<string, any>
const userMockSettings: StorageSettings = { sync: 'sync_value' }
const mockGetSync = jest.fn(
  async (key: string) =>
    await Promise.resolve({
      settings: userMockSettings
    })
)
browser.storage.sync.get = mockGetSync

const mockSetSync = jest.fn(async () => await Promise.resolve())
browser.storage.sync.set = mockSetSync

interface ManagedStorageSettings {
  enforced: StorageSettings
  defaults: StorageSettings
}
const systemMockSettings: ManagedStorageSettings = {
  enforced: {
    managed_enforced: 'managed_enforced_value'
  },
  defaults: {
    managed_default: 'managed_default_value'
  }
}
const mockGetManaged = jest.fn(
  async (key: string) =>
    await Promise.resolve({
      settings: systemMockSettings
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
  const syncPromise = new Promise<{ settings: StorageSettings }>(
    (resolve, reject) => {
      resSync = () => resolve({ settings: userMockSettings })
      rejSync = (reason?: any) => reject(reason)
    }
  )
  const managedPromise = new Promise<{ settings: ManagedStorageSettings }>(
    (resolve, reject) => {
      resManaged = () => resolve({ settings: systemMockSettings })
      rejManaged = (reason?: any) => reject(reason)
    }
  )

  mockGetSync.mockImplementationOnce(async (key: string) => await syncPromise)
  mockGetManaged.mockImplementationOnce(
    async (key: string) => await managedPromise
  )

  return { resSync, rejSync, resManaged, rejManaged }
}

const settingsString = JSON.stringify([
  ...merge(
    [systemMockSettings.enforced, true],
    [userMockSettings, false],
    [systemMockSettings.defaults, false],
    [defaults, false]
  )
])

/// /////////////////////////////////////////////////////////
// Set up React component for testing hook in.

const SettingsComponent: React.FunctionComponent = () => {
  const settings = useSettings()

  function handleUpdate (): void {
    settings
      .update(new Map([['update', { value: 'update_value', managed: false }]]))
      .catch(error => {
        testError(error)
      })
  }

  function handleClear (): void {
    settings.clear().catch(error => {
      testError(error)
    })
  }

  function handleFetch (): void {
    settings.fetch().catch(error => {
      testError(error)
    })
  }

  return (
    <section>
      <p data-testid='isInitialized'>{settings.isInitialized.toString()}</p>
      <p data-testid='settings'>{JSON.stringify([...settings.settings])}</p>
      <button data-testid='update' onClick={handleUpdate} />
      <button data-testid='clear' onClick={handleClear} />
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
test('useSettings(), fields test', async () => {
  const { resSync, resManaged } = manualGetMock()

  act(() => {
    render(<SettingsComponent />)
  })
  const isInitialized = screen.getByTestId('isInitialized')
  const settings = screen.getByTestId('settings')

  // Before hook is initialized
  expect(isInitialized.innerHTML).toEqual('false')
  expect(settings.innerHTML).toEqual(JSON.stringify([...new Map()]))

  act(() => {
    resSync()
    resManaged()
  })
  await waitFor(() => screen.getByText('true'))

  // After hook is intialized
  expect(mockGetSync).toHaveBeenCalledWith('settings')
  expect(mockGetManaged).toHaveBeenCalledWith('settings')
  expect(isInitialized.innerHTML).toEqual('true')
  expect(settings.innerHTML).toEqual(settingsString)

  // Test events
  fireEvent.click(screen.getByTestId('update'))
  await waitFor(() => expect(mockSetSync).toHaveBeenCalled())
  expect(mockSetSync).toHaveBeenCalledWith(
    expect.objectContaining({
      settings: {
        ...defaults,
        ...systemMockSettings.defaults,
        ...userMockSettings,
        update: 'update_value'
      }
    })
  )

  fireEvent.click(screen.getByTestId('clear'))
  await waitFor(() => expect(mockSetSync).toHaveBeenCalled())
  expect(mockSetSync).toHaveBeenCalledWith(
    expect.objectContaining({
      settings: {}
    })
  )

  mockGetManaged.mockClear()
  mockGetSync.mockClear()
  fireEvent.click(screen.getByTestId('fetch'))
  await waitFor(() => {
    expect(mockGetSync).toHaveBeenCalled()
    expect(mockGetManaged).toHaveBeenCalled()
  })
  expect(mockGetSync).toHaveBeenNthCalledWith(1, 'settings')
  expect(mockGetManaged).toHaveBeenNthCalledWith(1, 'settings')
})

/**
 * Test error handling
 */
test('useSettings(), fail sync init', async () => {
  const { rejSync, resManaged } = manualGetMock()
  const spy = jest.spyOn(global.console, 'error').mockImplementation(() => {})

  act(() => {
    render(<SettingsComponent />)
    rejSync('Sync Storage Error')
    resManaged()
  })
  await waitFor(() => expect(spy).toHaveBeenCalled())
  expect(spy).toHaveBeenCalledWith('Sync Storage Error')
  spy.mockRestore()
})

test('useSettings(), fail managed init', async () => {
  const { rejManaged, resSync } = manualGetMock()
  const spy = jest.spyOn(global.console, 'error').mockImplementation(() => {})

  act(() => {
    render(<SettingsComponent />)
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

test('useSettings(), sync storage change', async () => {
  const listeners: ChangeListener[] = []
  browser.storage.onChanged.addListener = jest.fn(listener => {
    listeners.push(listener)
  })
  act(() => {
    render(<SettingsComponent />)
  })

  await waitFor(() => screen.getByText('true'))

  const changeSettings: StorageSettings = {
    ...userMockSettings,
    change: 'change_value'
  }

  const settings = screen.getByTestId('settings')

  mockGetSync.mockImplementationOnce(
    async () => await Promise.resolve({ settings: changeSettings })
  )

  act(() => {
    for (const listener of listeners) {
      listener({ settings: { newValue: changeSettings } }, 'sync')
    }
  })
  await waitFor(() => expect(settings.innerHTML).not.toEqual(settingsString))

  expect(settings.innerHTML).toEqual(
    JSON.stringify([
      ...merge(
        [systemMockSettings.enforced, true],
        [changeSettings, false],
        [systemMockSettings.defaults, false],
        [defaults, false]
      )
    ])
  )
})

test('useSettings(), managed storage change', async () => {
  const listeners: ChangeListener[] = []
  browser.storage.onChanged.addListener = jest.fn(listener => {
    listeners.push(listener)
  })
  act(() => {
    render(<SettingsComponent />)
  })

  await waitFor(() => screen.getByText('true'))

  const changeSettings: ManagedStorageSettings = {
    enforced: {
      ...systemMockSettings.enforced,
      enforcedChange: 'enforced_change_value'
    },
    defaults: {
      ...systemMockSettings.defaults,
      defaultChange: 'default_change_value'
    }
  }

  const settings = screen.getByTestId('settings')

  mockGetManaged.mockImplementationOnce(
    async () => await Promise.resolve({ settings: changeSettings })
  )

  act(() => {
    for (const listener of listeners) {
      listener({ settings: { newValue: changeSettings } }, 'managed')
    }
  })
  await waitFor(() => expect(settings.innerHTML).not.toEqual(settingsString))

  expect(settings.innerHTML).toEqual(
    JSON.stringify([
      ...merge(
        [changeSettings.enforced, true],
        [userMockSettings, false],
        [changeSettings.defaults, false],
        [defaults, false]
      )
    ])
  )
})

test('useSettings(), skip change', async () => {
  const listeners: ChangeListener[] = []
  browser.storage.onChanged.addListener = jest.fn(listener => {
    listeners.push(listener)
  })
  act(() => {
    render(<SettingsComponent />)
  })

  await waitFor(() => screen.getByText('true'))

  // Local storage
  let changeSettings: StorageSettings = {
    local: 'local_value'
  }
  act(() => {
    for (const listener of listeners) {
      listener({ settings: { newValue: changeSettings } }, 'local')
    }
  })
  const settings = screen.getByTestId('settings')
  expect(settings.innerHTML).toEqual(settingsString)

  // Sync, wrong key
  changeSettings = { change: 'change_value' }
  act(() => {
    for (const listener of listeners) {
      listener(
        {
          notsettings: {
            newValue: changeSettings
          }
        },
        'sync'
      )
    }
  })
  expect(settings.innerHTML).toEqual(settingsString)

  // Managed, wrong key
  const changeManagedSettings: ManagedStorageSettings = {
    enforced: changeSettings,
    defaults: changeSettings
  }
  act(() => {
    for (const listener of listeners) {
      listener(
        {
          notsettings: {
            newValue: changeManagedSettings
          }
        },
        'managed'
      )
    }
  })
  expect(settings.innerHTML).toEqual(settingsString)
})
