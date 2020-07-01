import React, { useState, useEffect } from 'react'
import { useForm, FormEventCallbacks } from '../../hooks/utils/useForm'
import { Select, Checkbox, Button } from '../common/input'
import { Message } from '../common/layout'
import * as YubiKey from './YubiKey'
import * as TOTP from './TOTP'
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
  const [loginPromise, setLoginPromise] = useState<Promise<void>>()
  const [state, setState] = useState<{
    loading: boolean
    error?: Error
  }>({
    loading: false
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    setLoginPromise(onLogin(site, values))
  }

  // Handle asynchronous state in useEffect so that state updates can be
  // cancelled if the component unmounts.
  useEffect(() => {
    let mounted = true
    if (loginPromise !== undefined) {
      if (mounted) setState({ loading: true })
      loginPromise
        .then(() => {
          if (mounted) setState({ loading: false })
        })
        .catch(error => {
          if (mounted) setState({ loading: false, error })
        })
      if (mounted) setLoginPromise(undefined)
    }

    return (): void => {
      mounted = false
    }
  }, [loginPromise])

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
          <Button type='submit' color='accent' isLoading={state.loading}>
            Login
          </Button>
        </form>
      </article>
      {hasError && <Message type='error'>{state.error.message}</Message>}
    </section>
  )
}
