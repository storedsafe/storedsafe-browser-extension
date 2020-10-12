import { Readable, writable } from 'svelte/store'
import { vault } from '../../global/api'
import { deleteObject } from '../../global/api/vault'
import { sessions } from './browserstorage'

export const SEARCH_LOADING_ID = 'search.find'
export const SEARCH_EDIT_LOADING_ID = 'search.edit'
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

// TODO: Replace with actual results
let results: StoredSafeObject[] = []

export function searchStore (): SearchStore {
  let searchResults: StoredSafeObject[] = results
  let currentSessions: Map<string, Session> = null
  const { subscribe, set, update } = writable<StoredSafeObject[]>(searchResults)

  // TODO: Remove or real implementation?
  sessions.subscribe(newSessions => {
    if (newSessions === null) return
    currentSessions = newSessions
    searchResults = results.filter(({ host }) =>
      [...newSessions.keys()].includes(host)
    )
    set(searchResults)
  })

  return {
    subscribe,

    search: async function (needle) {
      let results: StoredSafeObject[] = []
      for (const [host, { token }] of currentSessions) {
        results.push(...(await vault.search(host, token, needle)))
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
      update(results => {
        const index = results.findIndex(({ id }) => id === result.id)
        results[index] = editResult
        return results
      })
      return editResult
    },

    delete: async function (result) {
      const { token } = currentSessions.get(result.host)
      const deleteResult = await vault.deleteObject(result.host, token, result)
      update(results => {
        return results.filter(({ id }) => id === result.id)
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
      update(results => {
        const index = results.findIndex(({ id }) => id === result.id)
        results[index] = decryptedResult
        return results
      })
      return decryptedResult
    }
  }
}

export const search = searchStore()
