import { useSessions } from '../storage/useSessions'
import { useState, useEffect } from 'react'
import { actions as StoredSafeActions } from '../../model/storedsafe/StoredSafe'
import {
  FLOW_FILL,
  ACTION_INIT
} from '../../scripts/content_script/messages/constants'

interface SearchHook {
  isInitialized: boolean
  results: SSObject[]
  errors: Map<string, Error>
  find: (needle: string) => Promise<void>
  fill: (id: number) => Promise<void>
  copy: (id: number, fieldId: number) => Promise<void>
  show: (id: number, fieldId: number) => Promise<void>
}

interface SearchState {
  results: SSObject[]
  errors: Map<string, Error>
}

export const useSearch = (): SearchHook => {
  const sessions = useSessions()
  const [state, setState] = useState<SearchState>()

  const isInitialized = sessions.isInitialized

  async function getTabResults (): Promise<SSObject[]> {
    return await browser.runtime.sendMessage({
      type: 'getTabResults'
    })
  }

  async function find (needle: string): Promise<void> {
    if (needle === '') {
      const results = await getTabResults()
      setState({ results, errors: new Map() })
      return
    }
    const promises: Array<Promise<void>> = []
    let results: SSObject[] = []
    const errors: Map<string, Error> = new Map()
    for (const host of sessions.sessions.keys()) {
      promises.push(
        StoredSafeActions.find(host, needle)
          .then(ssObjects => {
            results = [...results, ...ssObjects]
          })
          .catch(error => {
            errors.set(host, error)
          })
      )
    }
    await Promise.all(promises)
    setState({ results, errors })
  }

  async function decrypt (host: string, objectId: string): Promise<SSObject> {
    return await StoredSafeActions.decrypt(host, objectId)
  }

  async function fill (id: number): Promise<void> {
    async function sendFill (result: SSObject): Promise<void> {
      const data = result.fields.map(({ name, value }) => [name, value])
      const port = browser.runtime.connect()
      port.postMessage({
        type: `${FLOW_FILL}.${ACTION_INIT}`,
        data
      })
      window.close()
    }

    const result = state.results[id]
    if (result.isDecrypted) {
      await sendFill(result)
    } else {
      await sendFill(await decrypt(result.host, result.id))
    }
  }

  async function show (
    id: number,
    fieldId: number,
    show = true
  ): Promise<void> {
    let result = state.results[id]
    if (!result.isDecrypted && result.fields[fieldId].isEncrypted) {
      result = await decrypt(result.host, result.id)
    }
    setState(prevState => {
      const prevResults = prevState.results
      for (let i = 0; i < prevResults[id].fields.length; i++) {
        if (i === fieldId) {
          result.fields[i].isShowing = show
        } else {
          result.fields[i].isShowing = prevResults[id].fields[i].isShowing
        }
      }
      const newResults: SSObject[] = [...prevResults]
      newResults[id] = result

      return {
        ...prevState,
        results: newResults
      }
    })
  }

  async function copy (
    id: number,
    fieldId: number
  ): Promise<void> {
    let result = state.results[id]
    if (!result.isDecrypted && result.fields[fieldId].isEncrypted) {
      result = await decrypt(result.host, result.id)
    }
    await navigator.clipboard.writeText(result.fields[fieldId].value)
  }

  useEffect(() => {
    if (state === undefined) {
      getTabResults().then(results => {
        setState({ results, errors: new Map() })
      })
    }
  }, [state, isInitialized])

  return {
    isInitialized: isInitialized && state !== undefined,
    results: state?.results,
    errors: state?.errors,
    find,
    fill,
    copy,
    show
  }
}
