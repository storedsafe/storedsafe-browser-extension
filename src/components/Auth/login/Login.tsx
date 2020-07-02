import React, { useState, useEffect } from 'react'
import { useForm, FormEventCallbacks } from '../../../hooks/utils/useForm'
import { Select, Checkbox, Button } from '../../common/input'
import { Message } from '../../common/layout'
import * as YubiKey from '../YubiKey'
import * as TOTP from '../TOTP'
import './Login.scss'

type LoginFormValues = { remember: boolean } & LoginFields

export type OnLoginCallback = (
  site: Site,
  values: LoginFormValues
) => Promise<void>

interface LoginProps {
  site: Site
  onLogin: OnLoginCallback
  sitePreferences?: SitePreferences
  formEvents?: FormEventCallbacks
  error?: string
  loading?: boolean
}

interface LoginState {
  isLoading: boolean
  promise?: Promise<void>
  error?: Error
}

export const Login: React.FunctionComponent<LoginProps> = ({
  site,
  onLogin,
  sitePreferences,
  formEvents
}: LoginProps) => {
  const username = sitePreferences?.username
  const loginType = sitePreferences?.loginType

  const initialValues: LoginFormValues = {
    loginType: loginType !== undefined ? loginType : 'totp', // Set default to TOTP
    username: username !== undefined ? username : '',
    remember: username !== undefined,
    keys: '',
    passphrase: '',
    otp: ''
  }
  const [values, events, reset] = useForm(initialValues, formEvents)
  const [state, setState] = useState<LoginState>({ isLoading: false })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    setState({ isLoading: true, promise: onLogin(site, values) })
  }

  // Handle asynchronous state in useEffect so that state updates can be
  // cancelled if the component unmounts.
  // Put the promise with the rest of the state so that only a single render
  // is required when the state changes. This fixes the bug where the error
  // state would not be reached because the component would dismount when the
  // login promise was unset.
  useEffect(() => {
    let mounted = true
    if (state.isLoading && state.promise !== undefined) {
      state.promise
        .then(() => {
          if (mounted) setState({ isLoading: false })
        })
        .catch(error => {
          if (mounted) setState({ isLoading: false, error })
        })
    }

    return (): void => {
      mounted = false
    }
  }, [state])

  const id = (name: string): string => site.host + '-' + name
  const hasError = state.error !== undefined

  return (
    <section className='login'>
      <article className='login-form'>
        <form className='form' onSubmit={handleSubmit}>
          <label htmlFor={id('loginType')}>
            <span>Login Type</span>
            <Select
              id={id('loginType')}
              name='loginType'
              value={values.loginType}
              {...events}
            >
              <option value='yubikey'>YubiKey</option>
              <option value='totp'>TOTP</option>
            </Select>
          </label>
          <label htmlFor={id('username')}>
            <span>Username</span>
            <input
              type='text'
              id={id('username')}
              name='username'
              value={values.username}
              required
              {...events}
            />
          </label>
          {values.loginType === 'yubikey' &&
            YubiKey.renderFields([values, events, reset], id)}
          {values.loginType === 'totp' &&
            TOTP.renderFields([values, events, reset], id)}
          <label htmlFor={id('remember')} className='label-checkbox'>
            <span>Remember Username</span>
            <Checkbox
              id={id('remember')}
              name='remember'
              checked={values.remember}
              {...events}
            />
          </label>
          <Button type='submit' color='accent' isLoading={state.isLoading}>
            Login
          </Button>
        </form>
      </article>
      {hasError && <Message type='error'>{state.error.message}</Message>}
    </section>
  )
}
