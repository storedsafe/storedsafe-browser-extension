import React from 'react'
import { useLoading } from '../../../hooks/utils/useLoading'
import { Button } from '../../common/input'
import './ClearDataOptions.scss'

export type OnClearIgnore = () => Promise<void>
export type OnClearPreferences = () => Promise<void>
export type OnClearSessions = () => Promise<void>
export type OnClearSettings = () => Promise<void>
export type OnClearSites = () => Promise<void>
export type OnClearTabResults = () => Promise<void>
export type OnClearAll = () => Promise<void>

export interface ClearDataOptionsProps {
  clearAll: OnClearAll
}

export const ClearDataOptions: React.FunctionComponent<ClearDataOptionsProps> = ({
  clearAll
}: ClearDataOptionsProps) => {
  const [clearState, setClearPromise] = useLoading()

  function onClearAll (): void {
    setClearPromise(clearAll())
  }

  return (
    <section className='clear-data-options'>
      <Button
        color='danger'
        onClick={onClearAll}
        isLoading={clearState.isLoading}
      >
        Clear all user data
      </Button>
    </section>
  )
}
