import React from 'react'
import { useLoading } from '../../../hooks/utils/useLoading'
import { Button } from '../../../components/common/input'
import './BlacklistOptions.scss'

export type OnRemoveBlacklistHostCallback = (host: string) => Promise<void>

export interface BlacklistOptionsProps {
  removeBlacklistHost: OnRemoveBlacklistHostCallback
  blacklist: string[]
}

export const BlacklistOptions: React.FunctionComponent<BlacklistOptionsProps> = ({
  removeBlacklistHost,
  blacklist
}: BlacklistOptionsProps) => {
  const [removeState, setRemovePromise] = useLoading()

  function onRemove (host: string): void {
    setRemovePromise(removeBlacklistHost(host), host)
  }

  return (
    <section className='blacklist-options'>
      {blacklist.length === 0 && <p>Blacklist is empty.</p>}
      {blacklist.map(host => (
        <article key={host} className='blacklist-options-article'>
          <p className='blacklist-options-host'>{host}</p>
          <Button
            color='danger'
            onClick={() => onRemove(host)}
            isLoading={removeState.isLoading && removeState.key === host}
          >
            Delete
          </Button>
        </article>
      ))}
    </section>
  )
}
