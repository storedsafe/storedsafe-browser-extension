import React, { useState, useEffect } from 'react'

function debugStorage (storage: unknown): React.ReactNode {
  function isMap (storage: any[]): boolean {
    return storage.reduce((acc: boolean, element) => (
      acc && element instanceof Array && element.length === 2
    ), true)
  }

  function drawMap (storage: Map<any, any>): React.ReactNode {
    return [...storage].map(([key, value]) => {
      return (
        <li key={key}>
          <span>(map) <b>{key}</b>: {debugStorage(value)}</span>
        </li>
      )
    })
  }

  function drawArray (storage: any[]): React.ReactNode {
    return storage.map((value, id) => (
      <li key={id}>
        <span>(array) {debugStorage(value)}</span>
      </li>
    ))
  }

  function drawFunction (storage: Function): React.ReactNode {
    return (
      <span>(function) {storage.toString()}</span>
    )
  }

  function drawObject (storage: Record<string, any>): React.ReactNode {
    return Object.keys(storage).map((key) => (
      <li key={key}>
        <span>(object) <b>{key}</b>: {debugStorage(storage[key])}</span>
      </li>
    ))
  }

  if (storage === null) return storage

  if (storage instanceof Map) {
    return storage.size > 0 ? <ul>{drawMap(storage)}</ul> : null
  } else if (storage instanceof Array) {
    if (storage.length === 0) return '[]'
    if (isMap(storage)) {
      return <ul>{drawMap(new Map(storage))}</ul>
    } else {
      return <ul>{drawArray(storage)}</ul>
    }
  } else if (storage instanceof Function) {
    return <>{drawFunction(storage)}</>
  } else if (storage instanceof Object) {
    return Object.keys(storage).length > 0 ? <ul>{drawObject(storage)}</ul> : null
  } else {
    const value = storage as string | number | boolean
    return <span>{value.toString()}</span>
  }
}

const DebugStorage: React.FC = () => {
  const [local, setLocal] = useState<React.ReactNode>(null)
  const [sync, setSync] = useState<React.ReactNode>(null)
  const [managed, setManaged] = useState<React.ReactNode>(null)

  useEffect(() => {
    let mounted = true
    browser.storage.local.get().then((storage) => {
      if (mounted) setLocal(storage)
    }).catch((error) => { console.error('Local storage unavailable', error) })

    browser.storage.sync.get().then((storage) => {
      if (mounted) setSync(storage)
    }).catch((error) => { console.error('Sync storage unavailable', error) })

    browser.storage.managed.get().then((storage) => {
      if (mounted) setManaged(storage)
    }).catch((error) => { console.error('Managed storage unavailable', error) })

    return (): void => { mounted = false }
  }, [])

  return (
    <section className="debug-storage">
      <h1>Debug Storage</h1>
      <article className="storage-area storage-area-local">
        <h2>Local</h2>
        {local !== undefined && debugStorage(local)}
      </article>
      <article className="storage-area storage-area-sync">
        <h2>Sync</h2>
        {sync !== undefined && debugStorage(sync)}
      </article>
      <article className="storage-area storage-area-managed">
        <h2>Managed</h2>
        {managed !== undefined && debugStorage(managed)}
      </article>
    </section>
  )
}

export default DebugStorage
