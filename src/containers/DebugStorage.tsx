import React, { useState, useEffect } from 'react'
import { DebugStorage } from '../components/DebugStorage'

const DebugStorageContainer: React.FunctionComponent = () => {
  const [local, setLocal] = useState<object>(null)
  const [sync, setSync] = useState<object>(null)
  const [managed, setManaged] = useState<object>(null)

  useEffect(() => {
    let mounted = true
    browser.storage.local
      .get()
      .then(storage => {
        if (mounted) setLocal(storage)
      })
      .catch(error => {
        console.error('Local storage unavailable', error)
      })

    browser.storage.sync
      .get()
      .then(storage => {
        if (mounted) setSync(storage)
      })
      .catch(error => {
        console.error('Sync storage unavailable', error)
      })

    browser.storage.managed
      .get()
      .then(storage => {
        if (mounted) setManaged(storage)
      })
      .catch(error => {
        console.error('Managed storage unavailable', error)
      })

    return (): void => {
      mounted = false
    }
  }, [])

  return <DebugStorage local={local} sync={sync} managed={managed} />
}

export default DebugStorageContainer
