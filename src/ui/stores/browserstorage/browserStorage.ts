/**
 * TODO: Replace with actual browser.storage implementation
 */
import { readable } from 'svelte/store'
import {
  ignore,
  preferences,
  sessions,
  settings,
  sites
} from '../../../global/storage'

const emptyState: ExtensionStorage = {
  ignore: null,
  preferences: null,
  sessions: null,
  settings: null,
  sites: null
}

export const browserStorage = readable(emptyState, function start (set) {
  let storage: ExtensionStorage = emptyState

  function onIgnoreChange (newValue: string[], _oldValue: string[]) {
    storage.ignore = newValue
    set(storage)
  }

  function onPreferencesChange (newValue: Preferences, _oldValue: Preferences) {
    storage.preferences = newValue
    set(storage)
  }

  function onSessionsChange (
    newValue: Map<string, Session>,
    _oldValue: Map<string, Session>
  ) {
    storage.sessions = newValue
    set(storage)
  }

  function onSettingsChange (
    newValue: Map<string, Setting>,
    _oldValue: Map<string, Setting>
  ) {
    storage.settings = newValue
    set(storage)
  }

  function onSitesChange (newValue: Site[], _oldValue: Site[]) {
    storage.sites = newValue
    set(storage)
  }

  Promise.all([
    ignore.subscribe(onIgnoreChange),
    preferences.subscribe(onPreferencesChange),
    sessions.subscribe(onSessionsChange),
    settings.subscribe(onSettingsChange),
    sites.subscribe(onSitesChange)
  ]).then(values => {
    storage = {
      ignore: values[0],
      preferences: values[1],
      sessions: values[2],
      settings: values[3],
      sites: values[4]
    }
    set(storage)
  })

  return function stop () {
    ignore.unsubscribe(onIgnoreChange)
    preferences.unsubscribe(onPreferencesChange)
    sessions.unsubscribe(onSessionsChange)
    settings.unsubscribe(onSettingsChange)
    sites.unsubscribe(onSitesChange)
  }
})
