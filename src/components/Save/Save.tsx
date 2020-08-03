import React from 'react'
import { useLoading } from '../../hooks/utils/useLoading'
import { useForm } from '../../hooks/utils/useForm'
import { Button, Select } from '../common/input'
import { Message, LoadingComponent } from '../common/layout'
import './Save.scss'

export interface SaveValues {
  [key: string]: string
}

export interface TabValues extends SaveValues {
  url: string
  name: string
  [key: string]: string
}

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

export type SaveCallback = (
  host: string,
  values: SaveValues
) => Promise<void>
export type AddToBlacklistCallback = (host: string) => Promise<void>

export interface SaveProps {
  isInitialized: boolean
  error?: Error
  tabValues?: TabValues
  hosts: SelectType<string>
  vaults: SelectType<SSVault>
  templates: SelectType<SSTemplate>
  save: SaveCallback
  addToBlacklist: AddToBlacklistCallback
  success: boolean
  close: () => void
}

export const Save: React.FunctionComponent<SaveProps> = ({
  isInitialized,
  error,
  tabValues,
  hosts,
  vaults,
  templates,
  save,
  addToBlacklist,
  success,
  close
}: SaveProps) => {
  if (!isInitialized) return <LoadingComponent />
  const [values, events] = useForm<Partial<SaveValues>>({
    parentid: '0',
    ...(tabValues !== undefined ? tabValues : {})
  })
  const [saveState, setSavePromise] = useLoading()
  const [blacklistState, setBlacklistPromise] = useLoading()

  /// /////////////////////////////////////////////////////////
  // Set up event handlers

  function onHostChange ({
    target
  }: React.ChangeEvent<HTMLSelectElement>): void {
    hosts.onChange(Number(target.value))
  }

  function onVaultChange ({
    target
  }: React.ChangeEvent<HTMLSelectElement>): void {
    vaults.onChange(Number(target.value))
  }

  function onTemplateChange ({
    target
  }: React.ChangeEvent<HTMLSelectElement>): void {
    templates.onChange(Number(target.value))
  }

  /// /////////////////////////////////////////////////////////
  // Set up select boxes

  let selectHost: React.ReactNode = null
  let selectVault: React.ReactNode = null
  let selectTemplate: React.ReactNode = null

  if (hosts.values.length > 1) {
    selectHost = (
      <label htmlFor='host'>
        <span>Host</span>
        <Select
          value={hosts.selected}
          onChange={onHostChange}
          name='host'
          id='host'
        >
          {hosts.values.map((host, id) => (
            <option key={host} value={id}>
              {host}
            </option>
          ))}
        </Select>
      </label>
    )
  } else {
    selectHost = <h2>{hosts.values?.[hosts.selected]}</h2>
  }

  /// /////////////////////////////////////////////////////////
  // Handle error states

  if (error !== undefined) {
    return (
      <section className='save'>
        {selectHost}
        <Message type='error'>Error: {error.message}</Message>
      </section>
    )
  }

  if (vaults.values.length === 0) {
    return (
      <section className='save'>
        {selectHost}
        <Message type='warning'>
          <p>No vaults with write access found for this host.</p>
          <p>
            Add a vault or ask your administrator to give you access to one.
          </p>
        </Message>
      </section>
    )
  }

  if (templates.values.length === 0) {
    return (
      <section className='save'>
        {selectHost}
        <Message type='error'>
          <p>No templates found for this host.</p>
          <p>No templates are available, please contact your administrator.</p>
        </Message>
      </section>
    )
  }

  /// /////////////////////////////////////////////////////////
  // Continue select boxes

  if (vaults.values.length > 1) {
    selectVault = (
      <label htmlFor='vault'>
        <span>Vault</span>
        <Select
          value={vaults.selected}
          onChange={onVaultChange}
          name='vault'
          id='vault'
        >
          {vaults.values.map((vault, id) => (
            <option key={vault.id} value={id}>
              {vault.name}
            </option>
          ))}
        </Select>
      </label>
    )
  }

  if (templates.values.length > 1) {
    selectTemplate = (
      <label htmlFor='template'>
        <span>Template</span>
        <Select
          value={templates.selected}
          onChange={onTemplateChange}
          name='template'
          id='template'
        >
          {templates.values.map((template, id) => (
            <option key={template.id} value={id}>
              {template.name}
            </option>
          ))}
        </Select>
      </label>
    )
  }

  /// /////////////////////////////////////////////////////////
  // Submit handlers

  function onSave (event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()

    const host = hosts.values[hosts.selected]
    if (host === undefined) {
      setSavePromise(Promise.reject(new Error('No host selected.')))
      return
    }
    const vault = vaults.values[vaults.selected]
    if (vault === undefined) {
      setSavePromise(Promise.reject(new Error('No vault selected.')))
      return
    }
    const template = templates.values[templates.selected]
    if (template === undefined) {
      setSavePromise(Promise.reject(new Error('No template selected.')))
      return
    }

    // Filter out irrelevant fields
    const { templateid, groupid, parentid } = values
    const properties: SaveValues = { templateid, groupid, parentid }
    for (const { name } of template.structure) {
      if (values[name] !== undefined) {
        properties[name] = values[name]
      }
    }

    // Save global properties
    properties.groupid = vault.id
    properties.templateid = template.id

    setSavePromise(save(host, properties))
  }

  function onAddToBlacklist (): void {
    if (tabValues !== undefined) {
      addToBlacklist(tabValues.url).then(() => close())
    }
  }

  const template = templates.values[templates.selected]
  let fields: React.ReactNode = null
  if (template?.structure !== undefined) {
    fields = template.structure.map(({ title, name, isEncrypted, type }) => {
      const value = values[name] !== undefined ? values[name] : ''
      return (
        <label key={name} htmlFor={name} className='save-field'>
          <span>{title}</span>
          <input
            className={`save-field${isEncrypted ? ' encrypted' : ''}`}
            type={type === 'text-passwdgen' ? 'password' : 'text'}
            id={name}
            name={name}
            value={value}
            {...events}
          />
        </label>
      )
    })
  }

  return (
    <section className='save'>
      {success ? (
        <Message>Successfully added object to StoredSafe.</Message>
      ) : (
        <form className='save-form' onSubmit={onSave}>
          <div className='save-fields'>
            {selectHost}
            {selectVault}
            {selectTemplate}
            {fields}
          </div>
          <div className='save-buttons'>
            {saveState.error !== undefined && (
              <Message type='error'>Error: {saveState.error.message}</Message>
            )}
            <Button color='accent' isLoading={saveState.isLoading}>
              Add to StoredSafe
            </Button>
            <Button color='danger' onClick={close}>
              Close
            </Button>
            <Button
              type='button'
              color='primary'
              onClick={onAddToBlacklist}
              isLoading={blacklistState.isLoading}
            >
              Don&apos;t ask to save for {tabValues.url}
            </Button>
          </div>
        </form>
      )}
    </section>
  )
}
