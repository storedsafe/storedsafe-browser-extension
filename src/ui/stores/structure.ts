import { Readable, writable } from 'svelte/store'
import { vault } from '../../global/api'
import { sessions } from './browserstorage'
import { loading } from './loading'

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
    loading.add(
      `${STRUCTURE_REFRESH_LOADING_ID}.${host}`,
      Promise.all([
        vault.getVaults(host, token),
        vault.getTemplates(host, token),
        vault.getPolicies(host, token)
      ]),
      {
        onSuccess ([vaults, templates, policies]) {
          update(structure => {
            const newStructure: [string, StoredSafeStructure][] = [
              ...structure,
              [
                host,
                {
                  vaults,
                  templates,
                  policies
                }
              ]
            ]
            // Sort structure to ensure consistent order
            return new Map(
              newStructure.sort(([a], [b]) =>
                a.toUpperCase() < b.toUpperCase() ? -1 : 1
              )
            )
          })
        },
        onError: console.error
      }
    )
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
