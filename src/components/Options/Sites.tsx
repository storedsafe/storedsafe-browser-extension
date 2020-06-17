import React, { useState } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { Button, Message } from '../common';
import { useForm } from '../../hooks/useForm';
import './Sites.scss';

/**
 * Form values in the add site form.
 * */
interface AddSiteValues {
  host: string;
  apikey: string;
}

export const Sites: React.FunctionComponent = () => {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string>();

  /**
   * Initial values for the add site form.
   * */
  const addSiteInitialValues = { host: '', apikey: '' };
  const [
    addSiteValues, events, reset
  ] = useForm<AddSiteValues>(addSiteInitialValues, {
    onFocus: () => setError(undefined),
  });
  const { state, dispatch, isInitialized } = useStorage();

  if (!isInitialized) return <p>Loading...</p>;

  const { system, user } = state.sites.collections;

  /**
   * List of sites managed by the system administrator
   * */
  const managedSites = system.map((site) => {
    return <li key={site.host}><span>{site.host}</span></li>;
  });

  /**
   * Creates a closure around a host to be used as a callback
   * funtion for a button click to remove a site from storage.
   * */
  const onRemove = (
    removeHost: string
  ): () => void => (): void => {
    setLoading({ ...loading, [removeHost]: true });
    const id = user.findIndex(({ host }) => host === removeHost);
    dispatch({
      sites: {
        type: 'remove', id
      },
    }, {
      onSuccess: () => {
        setLoading({ ...loading, [removeHost]: false })
      },
      onError: () => {
        setLoading({ ...loading, [removeHost]: false })
      },
    })
  };

  /**
   * List of sites managed by the user.
   * */
  const userSites = user.map((site) => (
    <li key={site.host}>
      <span>{site.host}</span>
      <Button
        color="danger"
        onClick={onRemove(site.host)}
        isLoading={loading[site.host] || false}>
        Delete
      </Button>
    </li>
  ));

  /**
   * Callback function to add site after the add site form
   * is submitted.
   * */
  const onAdd = (
    event: React.FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();
    const { host, apikey } = addSiteValues;
    const match = host.match(/^.*:\/\/([^/]+)(\/.*|\/?$)/);
    const matchedHost = match === null ? host : match[1];
    const hasSite = state.sites.list.reduce((hasHost, { host: siteHost }) => (
      hasHost || siteHost === matchedHost
    ), false);
    if (hasSite) {
      setError(`Duplicate site: ${matchedHost}`);
      return
    }
    setLoading({ ...loading, add: true });
    dispatch({
      sites: {
        type: 'add',
        site: { host: matchedHost, apikey },
      },
    }, {
      onSuccess: () => {
        setLoading({ ...loading, add: false });
        reset();
      },
      onError: (error) => {
        setLoading({ ...loading, add: false })
        console.error(error);
      },
    })
  }

  return (
    <section className="sites">
      <article className="sites-article sites-add">
        <header className="sites-article-header">
          <h3>Add new site</h3>
        </header>
        <form className="sites-add-form" onSubmit={onAdd}>
          <label htmlFor="host">
            Host
            <input
              type="text"
              name="host"
              id="host"
              placeholder="Host"
              required
              value={addSiteValues.host}
              {...events}
            />
          </label>
          <label htmlFor="apikey">
            API Key
            <input
              type="text"
              name="apikey"
              id="apikey"
              placeholder="API Key"
              required
              value={addSiteValues.apikey}
              {...events}
            />
          </label>
          <Button
            color="accent"
            type="submit"
            isLoading={loading.add || false}>
            Add Site
          </Button>
          {error && <Message type="error">{error}</Message>}
        </form>
      </article>

      {userSites.length > 0 && (<article
        className="sites-article sites-user">
        <header className="sites-article-header">
          <h3>Sites managed by user</h3>
        </header>
        <ul className="sites-list sites-user-list">
          {userSites}
        </ul>
      </article>)
      }

      {managedSites.length > 0 && (<article
        className="sites-article sites-managed">
        <header className="sites-article-header">
          <h3>Sites managed by organization</h3>
        </header>
        <ul className="sites-list sites-managed-list">
          {managedSites}
        </ul>
      </article>)
      }

    </section>
  );
};
