import { useSessions } from '../storage/useSessions'
import { useState, useEffect } from 'react'
import { actions as StoredSafeActions } from '../../model/storedsafe/StoredSafe'
import { useTabResults } from '../storage/useTabResults'
import { FLOW_FILL, ACTION_INIT } from '../../scripts/content_script/messages/constants'

interface SearchHook {
  isInitialized: boolean
  results: Results
  errors: Map<string, Error>
  find: (needle: string) => Promise<void>
  fill: (host: string, id: number) => Promise<void>
  copy: (host: string, id: number, fieldId: number) => Promise<void>
  show: (host: string, id: number, fieldId: number) => Promise<void>
}

interface SearchState {
  results: Results
  errors: Map<string, Error>
}

export const useSearch = (): SearchHook => {
  const sessions = useSessions()
  const tabResults = useTabResults()
  const [state, setState] = useState<SearchState>()

  const isInitialized = sessions.isInitialized && tabResults.isInitialized

  async function getTabResults (): Promise<Results> {
    const [{ id }] = await browser.tabs.query({
      currentWindow: true,
      active: true
    })
    return tabResults.tabResults.get(id)
  }

  async function find (needle: string): Promise<void> {
    if (needle === '') {
      const results = await getTabResults()
      setState({ results, errors: new Map() })
      return
    }
    const promises: Array<Promise<void>> = []
    const results: Results = new Map()
    const errors: Map<string, Error> = new Map()
    for (const host of sessions.sessions.keys()) {
      promises.push(
        StoredSafeActions.find(host, needle)
          .then(ssObjects => {
            results.set(host, ssObjects)
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

  async function fill (host: string, id: number): Promise<void> {
    async function sendFill (result: SSObject): Promise<void> {
      const data = result.fields.map(({ name, value }) => [name, value])
      const port = browser.runtime.connect()
      port.postMessage({
        type: `${FLOW_FILL}.${ACTION_INIT}`,
        data
      })
      window.close()
    }

    const ssObject = state.results.get(host)[id]
    if (ssObject.isDecrypted) {
      await sendFill(ssObject)
    } else {
      await sendFill(await decrypt(host, ssObject.id))
    }
  }

  async function show (
    host: string,
    id: number,
    fieldId: number,
    show = true
  ): Promise<void> {
    let result = state.results.get(host)[id]
    if (!result.isDecrypted && result.fields[fieldId].isEncrypted) {
      result = await decrypt(host, result.id)
    }
    setState(prevState => {
      const prevResults = prevState.results.get(host)
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
        results: new Map([...prevState.results, [host, newResults]])
      }
    })
  }

  async function copy (
    host: string,
    id: number,
    fieldId: number
  ): Promise<void> {
    let result = state.results.get(host)[id]
    if (!result.isDecrypted && result.fields[fieldId].isEncrypted) {
      result = await decrypt(host, result.id)
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
