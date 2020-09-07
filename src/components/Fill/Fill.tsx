import React, { useRef, useEffect } from 'react'
import { useLoading } from '../../hooks/utils/useLoading'
import { Button, Select } from '../common/input'
import { Message, LoadingComponent } from '../common/layout'
import './Fill.scss'

export type FillCallback = (ssObject: SSObject) => Promise<void>

export interface FillProps {
  isInitialized: boolean
  error?: Error
  fill: FillCallback
  results: SSObject[]
  close: () => void
  resize: (width: number, height: number) => void
}

export const Fill: React.FunctionComponent<FillProps> = ({
  isInitialized,
  error,
  fill,
  results,
  close,
  resize
}: FillProps) => {
  if (!isInitialized || results === undefined) return <LoadingComponent />
  const [fillState, setFillPromise] = useLoading()
  const frameRef = useRef<HTMLElement>()

  if (error !== undefined) {
    return (
      <section className='fill'>
        <Message type='error'>Error: {error.message}</Message>
      </section>
    )
  }

  useEffect(() => {
    const width = document.body.scrollWidth
    const height = document.body.scrollHeight
    resize(width, height)
  }, [frameRef])

  return (
    <section ref={frameRef} className='fill'>
      <article className='fill-info'>
        <p>Multiple logins available, please pick one from the list below.</p>
        <p>
          This will be your preferred login for this page until you manually
          select another login from the extension popup.
        </p>
      </article>
      <div className='fill-buttons'>
        {fillState.error !== undefined && (
          <Message type='error'>Error: {fillState.error.message}</Message>
        )}
        {results.map(result => {
          const fields = result.fields.map(field =>
            field.value?.length > 0 && field.isEncrypted === false ? (
              <p className='fill-fields' key={field.name}>{field.title}: {field.value}</p>
            ) : (
              ''
            )
          )
          return (
            <button
              className='fill-option'
              onClick={() => fill(result)}
              key={result.host + result.id}
            >
              {fields}
            </button>
          )
        })}
        <Button
          type='button'
          color='danger'
          onClick={close}
          className='fill-buttons-close'
        >
          Close
        </Button>
      </div>
    </section>
  )
}
