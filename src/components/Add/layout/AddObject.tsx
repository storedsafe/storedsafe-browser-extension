import React from 'react'
import { useLoading } from '../../../hooks/utils/useLoading'
import { useForm } from '../../../hooks/utils/useForm'
import { Button, Select } from '../../common/input'
import { Message } from '../../common/layout'
import './AddObject.scss'

export interface AddValues {
  [key: string]: string
}

export interface TabValues extends AddValues {
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

export type AddObjectCallback = (
  host: string,
  values: AddValues
) => Promise<void>
export type AddToBlacklistCallback = (host: string) => Promise<void>

export interface AddObjectProps {
  error?: Error
  tabValues?: TabValues
  hosts: SelectType<string>
  vaults: SelectType<SSVault>
  templates: SelectType<SSTemplate>
  addObject: AddObjectCallback
  addToBlacklist: AddToBlacklistCallback
}

export const AddObject: React.FunctionComponent<AddObjectProps> = ({
  error,
  tabValues,
  hosts,
  vaults,
  templates,
  addObject,
  addToBlacklist
}: AddObjectProps) => {
  const [values, events] = useForm<Partial<AddValues>>({
    parentid: '0',
    ...(tabValues !== undefined ? tabValues : {})
  })
  const [addState, setAddPromise] = useLoading()
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
      <section className='add-object'>
        {selectHost}
        <Message type='error'>Error: {error.message}</Message>
      </section>
    )
  }

  if (vaults.values.length === 0) {
    return (
      <section className='add-object'>
        {selectHost}
        <Message type='warning'>
          <p>No vaults found for this host.</p>
          <p>
            Add a vault or ask your administrator to give you access to one.
          </p>
        </Message>
      </section>
    )
  }

  if (templates.values.length === 0) {
    return (
      <section className='add-object'>
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

  function onAdd (event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()

    const host = hosts.values[hosts.selected]
    if (host === undefined) {
      setAddPromise(Promise.reject(new Error('No host selected.')))
      return
    }
    const vault = vaults.values[vaults.selected]
    if (vault === undefined) {
      setAddPromise(Promise.reject(new Error('No vault selected.')))
      return
    }
    const template = templates.values[templates.selected]
    if (template === undefined) {
      setAddPromise(Promise.reject(new Error('No template selected.')))
      return
    }

    // Filter out irrelevant fields
    const { templateid, groupid, parentid } = values
    const properties: AddValues = { templateid, groupid, parentid }
    for (const { name } of template.structure) {
      if (values[name] !== undefined) {
        properties[name] = values[name]
      }
    }

    // Add global properties
    properties.groupid = vault.id
    properties.templateid = template.id

    setAddPromise(addObject(host, properties))
  }

  function onAddToBlacklist (): void {
    if (tabValues !== undefined) {
      setBlacklistPromise(addToBlacklist(tabValues.url))
    }
  }

  const template = templates.values[templates.selected]
  let fields: React.ReactNode = null
  if (template?.structure !== undefined) {
    fields = template.structure.map(({ title, name, isEncrypted, type }) => {
      const value = values[name] !== undefined ? values[name] : ''
      return (
        <label key={name} htmlFor={name} className='add-object-field'>
          <span>{title}</span>
          <input
            className={`add-object-field${isEncrypted ? ' encrypted' : ''}`}
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
    <section className='add-object'>
      <form className='add-object-form' onSubmit={onAdd}>
        {selectHost}
        {selectVault}
        {selectTemplate}
        {fields}
        <Button color='accent' isLoading={addState.isLoading}>
          Add to StoredSafe
        </Button>
        {addState.error !== undefined && (
          <Message type='error'>Error: {addState.error.message}</Message>
        )}
      </form>
      {tabValues !== undefined && (
        <>
          <Button
            type='button'
            color='danger'
            onClick={onAddToBlacklist}
            isLoading={blacklistState.isLoading}
          >
            Don&apos;t ask to save for {tabValues.url}
          </Button>
          {blacklistState.error !== undefined && (
            <Message type='error'>Error: {addState.error.message}</Message>
          )}
        </>
      )}
    </section>
  )
}
