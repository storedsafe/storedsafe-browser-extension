import { Readable, writable } from 'svelte/store'
import { sessions } from './browserstorage'

export const SEARCH_LOADING_ID = 'search.find'
export const SEARCH_EDIT_LOADING_ID = 'search.edit'
export const SEARCH_REMOVE_LOADING_ID = 'search.remove'
export const SEARCH_DECRYPT_LOADING_ID = 'search.remove'

interface SearchStore extends Readable<StoredSafeObject[]> {
  search: (needle: string) => Promise<void>
  edit: (
    host: string,
    id: string,
    values: Record<string, string>
  ) => Promise<StoredSafeObject>
  delete: (host: string, id: string) => Promise<StoredSafeObject>
  decrypt: (host: string, id: string) => Promise<StoredSafeObject>
}

// TODO: Replace with actual results
let results: StoredSafeObject[] = []

export function searchStore (): SearchStore {
  let searchResults: StoredSafeObject[] = results
  const { subscribe, set, update } = writable<StoredSafeObject[]>(searchResults)

  // TODO: Remove or real implementation?
  sessions.subscribe(newSessions => {
    if (newSessions === null) return
    searchResults = results.filter(({ host }) =>
      [...newSessions.keys()].includes(host)
    )
    set(searchResults)
  })

  return {
    subscribe,

    search: function (needle) {
      // TODO: Real implementation
      return Promise.resolve()
    },

    edit: function (host, id, values) {
      // TODO: Real implementation
      return Promise.resolve<StoredSafeObject>({
        fields: [],
        host: '',
        icon: '',
        id: '',
        isDecrypted: false,
        name: '',
        templateId: '',
        type: '',
        vaultId: ''
      })
    },

    delete: function (host, id) {
      // TODO: Real implementation
      return Promise.resolve<StoredSafeObject>({
        fields: [],
        host: '',
        icon: '',
        id: '',
        isDecrypted: false,
        name: '',
        templateId: '',
        type: '',
        vaultId: ''
      })
    },

    decrypt: function (host, id) {
      // TODO: Real implementation
      return Promise.resolve<StoredSafeObject>({
        fields: [],
        host: '',
        icon: '',
        id: '',
        isDecrypted: false,
        name: '',
        templateId: '',
        type: '',
        vaultId: ''
      })
    }
  }
}

export const search = searchStore()
