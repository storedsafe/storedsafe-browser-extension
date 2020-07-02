import React from 'react'
import { useForm } from '../hooks/utils/useForm'
import { Button } from '../components/common/input'

const OptionsContainer: React.FunctionComponent = () => {
  const [values, events] = useForm<Site>({ host: '', apikey: '' })
  return (
    <section className='options'>
      <form>
        <label htmlFor='host'>
          <span>Host</span>
          <input
            type='text'
            id='host'
            name='host'
            value={values.host}
            {...events}
          />
        </label>
        <label htmlFor='apikey'>
          <span>API Key</span>
          <input
            type='password'
            id='apikey'
            name='apikey'
            value={values.apikey}
            {...events}
          />
        </label>
        <Button color='accent'>Add Site</Button>
      </form>
    </section>
  )
}

export default OptionsContainer
