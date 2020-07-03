import React from 'react'
import './GeneralOptions.scss'
import { useForm } from '../../../hooks/utils/useForm'
import { fields } from './fields'
import { Checkbox, Button } from '../../common/input'
import { useLoading } from '../../../hooks/utils/useLoading'
import { Message } from '../../common/layout'

type Values = Record<string, string | number | boolean>
export type OnSaveSettingsCallback = (settings: Settings) => Promise<void>

export interface GeneralOptionsProps {
  settings: Settings
  saveSettings: OnSaveSettingsCallback
}

export const GeneralOptions: React.FunctionComponent<GeneralOptionsProps> = ({
  settings,
  saveSettings
}: GeneralOptionsProps) => {
  const initialValues: Values = {}
  for (const [field, { value }] of settings) {
    initialValues[field] = value
  }
  const [values, events] = useForm(initialValues)
  const [state, setPromise] = useLoading()

  function onSave (event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    const newSettings: Settings = new Map(settings)
    Object.keys(values).forEach(field => {
      newSettings.set(field, {
        value: values[field],
        managed: settings.get(field).managed
      })
    })
    setPromise(saveSettings(newSettings))
  }

  const settingsFields = Object.keys(fields).map(field => {
    if (settings.get(field) === undefined) {
      throw new Error(`Field '${field}' is missing a default value.`)
    }
    const { label, unit, attributes } = fields[field]
    const disabled = settings.get(field).managed
    attributes.id = field
    attributes.name = field
    attributes.disabled = disabled
    attributes.title = disabled
      ? 'This field is managed by your organization'
      : ''
    const labelClassNames = [
      'general-options-label',
      disabled ? 'label-disabled' : '',
      attributes.type === 'checkbox' ? 'label-inline' : '',
      values[field] !== settings.get(field).value ? 'label-altered' : ''
    ].join(' ')

    if (attributes.type === 'checkbox') {
      return (
        <label key={field} htmlFor={field} className={labelClassNames}>
          <div className='general-options-field'>
            <Checkbox
              checked={values[field] as boolean}
              {...events}
              {...attributes}
            />
          </div>
          <span>{label}</span>
        </label>
      )
    } else {
      return (
        <label key={field} htmlFor={field} className={labelClassNames}>
          <span>{label}</span>
          <div className='general-options-field'>
            <input
              value={values[field] as string | number}
              {...events}
              {...attributes}
            />
            <span>{unit}</span>
          </div>
        </label>
      )
    }
  })

  return (
    <section className='general-options'>
      <form className='general-options-form' onSubmit={onSave}>
        {settingsFields}
        <Button type='submit' isLoading={state.isLoading}>
          Save
        </Button>
        {state.error !== undefined && <Message type='error'>Error: {state.error.message}</Message>}
      </form>
    </section>
  )
}
