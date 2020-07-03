import React from 'react'
import { useForm } from '../../../hooks/utils/useForm'
import { useLoading } from '../../../hooks/utils/useLoading'
import { Button } from '../../../components/common/input'
import { Message } from '../../common/layout'
import './SiteOptions.scss'

export type OnAddSiteCallback = (site: Site) => Promise<void>
export type OnRemoveSiteCallback = (id: number) => Promise<void>

export interface SiteOptionsProps {
  addSite: OnAddSiteCallback
  removeSite: OnRemoveSiteCallback
  systemSites: Site[]
  userSites: Site[]
}

export const SiteOptions: React.FunctionComponent<SiteOptionsProps> = ({
  addSite,
  removeSite,
  systemSites,
  userSites
}: SiteOptionsProps) => {
  const [values, events, reset] = useForm<Site>({ host: '', apikey: '' })
  const [addState, setAddPromise] = useLoading()
  const [removeState, setRemovePromise] = useLoading()

  function onAdd (event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    setAddPromise(addSite(values).then(() => reset()))
  }

  function onRemove (id: number): void {
    setRemovePromise(removeSite(id), id)
  }

  return (
    <section className='site-options'>
      <article className='site-options-article site-options-add'>
        <form onSubmit={onAdd}>
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
          <Button color='accent' type='submit' isLoading={addState.isLoading}>
            Add Site
          </Button>
          {addState.error !== undefined && (
            <Message type='error'>{addState.error.message}</Message>
          )}
        </form>
      </article>
      {systemSites.length !== 0 && (
        <article className='site-options-article site-options-system'>
          <h3>Sites managed by organization</h3>
          {systemSites.map(site => (
            <article key={site.host} className='site-options-site'>
              <p className='site-options-host'>{site.host}</p>
            </article>
          ))}
        </article>
      )}
      {userSites.length !== 0 && (
        <article className='site-options-article site-options-user'>
          <h3>User sites</h3>
          {userSites.map((site, id) => (
            <article key={site.host} className='site-options-site'>
              <p className='site-options-host'>{site.host}</p>
              <Button
                color='danger'
                onClick={() => onRemove(id)}
                isLoading={removeState.isLoading && removeState.key === id}
              >
                Delete
              </Button>
            </article>
          ))}
        </article>
      )}
    </section>
  )
}
