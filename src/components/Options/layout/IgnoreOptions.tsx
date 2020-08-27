import React from 'react'
import { useLoading } from '../../../hooks/utils/useLoading'
import { Button } from '../../common/input'
import './IgnoreOptions.scss'

export type OnRemoveIgnoreHostCallback = (host: string) => Promise<void>

export interface IgnoreOptionsProps {
  removeIgnoreHost: OnRemoveIgnoreHostCallback
  ignore: string[]
}

export const IgnoreOptions: React.FunctionComponent<IgnoreOptionsProps> = ({
  removeIgnoreHost,
  ignore
}: IgnoreOptionsProps) => {
  const [removeState, setRemovePromise] = useLoading()

  function onRemove (host: string): void {
    setRemovePromise(removeIgnoreHost(host), host)
  }

  return (
    <section className='ignore-options'>
      {ignore.length === 0 && <p>Ignore list is empty.</p>}
      {ignore.map(host => (
        <article key={host} className='ignore-options-article'>
          <p className='ignore-options-host'>{host}</p>
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
