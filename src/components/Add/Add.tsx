import React from 'react'
import './Add.scss'
import { AddObject, AddObjectProps, AddValues } from './layout/AddObject'
import { Button } from '../common/input'
import { Message, LoadingComponent } from '../common/layout'

export * from './layout/AddObject'

export type OnSelectChangeCallback = (selected: number) => void
export interface SelectType<T> {
  values: T[]
  selected?: number
  onChange: OnSelectChangeCallback
}

export interface SiteState {
  vaults: SSVault[]
  templates: SSTemplate[]
  host: string
  vault: string
  template: string
}

export type AddObjectCallback = (
  host: string,
  values: AddValues
) => Promise<void>

export interface AddProps {
  isInitialized: boolean
  addObjectProps: AddObjectProps
  success: boolean
  clearSuccess: () => void
}

export const Add: React.FunctionComponent<AddProps> = ({
  isInitialized,
  addObjectProps,
  success,
  clearSuccess
}: AddProps) => {
  if (!isInitialized) return <LoadingComponent />

  return (
    <section className='add'>
      {success ? (
        <>
          <Message>Successfully added object to StoredSafe.</Message>
          <Button onClick={clearSuccess}>Click to add a new object</Button>
        </>
      ) : (
        <AddObject {...addObjectProps} />
      )}
    </section>
  )
}
