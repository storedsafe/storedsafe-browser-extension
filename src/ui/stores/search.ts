import { Readable, writable } from 'svelte/store'
import { vault } from '../../global/api'
import type { Message } from '../../global/messages'
import { sessions } from './browserstorage'

export const SEARCH_LOADING_ID = 'search.find'
export const SEARCH_EDIT_LOADING_ID = 'search.edit'
export const SEARCH_DELETE_LOADING_ID = 'search.delete'
export const SEARCH_REMOVE_LOADING_ID = 'search.remove'
export const SEARCH_DECRYPT_LOADING_ID = 'search.remove'

interface SearchStore extends Readable<StoredSafeObject[]> {
  search: (needle: string) => Promise<void>
  edit: (
    result: StoredSafeObject,
    values: Record<string, string>
  ) => Promise<StoredSafeObject>
  delete: (result: StoredSafeObject) => Promise<StoredSafeObject>
  decrypt: (result: StoredSafeObject) => Promise<StoredSafeObject>
}

export function searchStore(): SearchStore {
  let tabResults: StoredSafeObject[] = []
  let results: StoredSafeObject[] = null
  let currentSessions: Map<string, Session> = null
  const { subscribe, set, update } = writable<StoredSafeObject[]>(results ?? [])

  function onMessage(message: Message) {
    if (message.context === 'autosearch' && message.action === 'populate') {
      tabResults = message.data
      set(tabResults)
    }
  }

  const port = browser.runtime.connect({ name: 'search' })
  port.onMessage.addListener(onMessage)

  sessions.subscribe(newSessions => {
    if (newSessions === null) return
    currentSessions = newSessions
    results = results?.filter(({ host }) =>
      [...newSessions.keys()].includes(host)
    )
    set(results ?? [])
  })

  return {
    subscribe,

    search: async function (needle) {
      if (needle === '') {
        results = tabResults
      } else {
        results = []
        for (const [host, { token }] of currentSessions) {
          const siteResults = await vault.search(host, token, needle)
          results.push(...siteResults)
        }
      }
      set(results)
    },

    edit: async function (result, values) {
      const { token } = currentSessions.get(result.host)
      const editResult = await vault.editObject(
        result.host,
        token,
        result,
        values
      )
      update(prevResults => {
        results = [...prevResults]
        const index = results.findIndex(({ id }) => id === result.id)
        results[index] = editResult
        return results
      })
      return editResult
    },

    delete: async function (result) {
      const { token } = currentSessions.get(result.host)
      const deleteResult = await vault.deleteObject(result.host, token, result)
      update(prevResults => {
        results = prevResults.filter(({ id }) => id !== result.id)
        return results
      })
      return deleteResult
    },

    decrypt: async function (result) {
      const { token } = currentSessions.get(result.host)
      const decryptedResult = await vault.decryptObject(
        result.host,
        token,
        result
      )
      update(prevResults => {
        results = [...prevResults]
        const index = prevResults.findIndex(({ id }) => id === result.id)
        results[index] = decryptedResult
        return results
      })
      return decryptedResult
    }
  }
}

export const search = searchStore()
