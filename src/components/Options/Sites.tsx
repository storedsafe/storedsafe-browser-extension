import React, { useState } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { Button, Message } from '../ui/common';
import { useForm } from '../../hooks/useForm';
import './Sites.scss';

/**
 * Form values in the add site form.
 * */
interface AddSiteValues {
  url: string;
  apikey: string;
}

export const Sites: React.FunctionComponent = () => {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string>();

  /**
   * Initial values for the add site form.
   * */
  const addSiteInitialValues = { url: '', apikey: '' };
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
  const managedSites = system.map((site) => (
    <li key={site.url}><span>{site.url}</span></li>
  ));

  /**
   * Creates a closure around a url to be used as a callback
   * funtion for a button click to remove a site from storage.
   * */
  const onRemove = (
    removeUrl: string
  ): () => void => (): void => {
    setLoading({ ...loading, [removeUrl]: true });
    const id = user.findIndex(({ url }) => url === removeUrl);
    dispatch({
      sites: {
        type: 'remove', id
      },
    }, {
      onSuccess: () => {
        setLoading({ ...loading, [removeUrl]: false })
      },
      onError: () => {
        setLoading({ ...loading, [removeUrl]: false })
      },
    })
  };

  /**
   * List of sites managed by the user.
   * */
  const userSites = user.map((site) => (
    <li key={site.url}>
      <span>{site.url}</span>
      <Button
        color="danger"
        onClick={onRemove(site.url)}
        isLoading={loading[site.url] || false}>
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
    const { url, apikey } = addSiteValues;
    const match = url.match(/^.*:\/\/([^/]+)(\/.*|\/?$)/);
    const matchedUrl = match === null ? url : match[1];
    const hasSite = state.sites.list.reduce((hasUrl, { url: siteUrl }) => (
      hasUrl || siteUrl === matchedUrl
    ), false);
    if (hasSite) {
      setError(`Duplicate site: ${matchedUrl}`);
      return
    }
    setLoading({ ...loading, add: true });
    dispatch({
      sites: {
        type: 'add',
        site: { url: matchedUrl, apikey },
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
          <label htmlFor="url">
            URL
            <input
              type="text"
              name="url"
              id="url"
              placeholder="URL"
              required
              value={addSiteValues.url}
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
