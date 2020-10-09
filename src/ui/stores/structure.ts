import { Readable, writable } from 'svelte/store'
import { sessions } from './browserstorage'

export const STRUCTURE_REFRESH_LOADING_ID = 'structure.refresh'

interface StoredSafeStructure {
  vaults: StoredSafeVault[]
  templates: StoredSafeTemplate[]
  policies: StoredSafePasswordPolicy[]
}

interface StructureStore extends Readable<Map<string, StoredSafeStructure>> {
  refresh: (host: string) => void
  refreshAll: () => void
}

const emptyState: Map<string, StoredSafeStructure> = new Map()

function structureStore (): StructureStore {
  const { subscribe, update } = writable<Map<string, StoredSafeStructure>>(
    emptyState
  )

  sessions.subscribe(newSessions => {
    if (newSessions === null) return
    update(previousStructure => {
      // Fetch new host structures
      for (const host of newSessions.keys()) {
        if (!previousStructure.has(host)) refresh(host)
      }
      // Remove disconnected hosts
      for (const host of previousStructure.keys()) {
        if (!newSessions.has(host)) previousStructure.delete(host)
      }
      return previousStructure
    })
  })

  function refresh (host: string): void {
    // TODO: Real implementation
    // loading.add(`${STRUCTURE_REFRESH_LOADING_ID}.${host}`, promise)
  }

  function refreshAll (): void {
    // TODO: Real implementation
  }

  return {
    subscribe,
    refresh,
    refreshAll
  }
}

export const structure = structureStore()
