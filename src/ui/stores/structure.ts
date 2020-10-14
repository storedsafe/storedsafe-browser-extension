import { Readable, writable } from 'svelte/store'
import { vault } from '../../global/api'
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
  let currentSessions: Map<string, Session> = null
  const { subscribe, update } = writable<Map<string, StoredSafeStructure>>(
    emptyState
  )

  sessions.subscribe(newSessions => {
    if (newSessions === null) return
    currentSessions = newSessions
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
    const { token } = currentSessions.get(host)
    Promise.all([
      vault.getVaults(host, token),
      vault.getTemplates(host, token),
      vault.getPolicies(host, token)
    ]).then(([vaults, templates, policies]) => {
      update(
        structure =>
          new Map([
            ...structure,
            [
              host,
              {
                vaults,
                templates,
                policies
              }
            ]
          ])
      )
    })
  }

  function refreshAll (): void {
    for (const [host] of currentSessions) {
      refresh(host)
    }
  }

  return {
    subscribe,
    refresh,
    refreshAll
  }
}

export const structure = structureStore()
