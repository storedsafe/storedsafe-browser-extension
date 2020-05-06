import React, { Fragment } from 'react';
import { useStorage } from '../../state/StorageState';
import { Button } from '../Layout';
import {
  Form,
  FormValues,
  RenderFunction,
  OnSubmitCallback,
} from '../Form';
import './Sites.scss';

export const Sites: React.FunctionComponent = () => {
  const [state, dispatch] = useStorage();

  if (!state.isInitialized) return <p>Loading...</p>;

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
    const id = user.findIndex(({ url }) => url === removeUrl);
    dispatch({
      sites: {
        type: 'remove', id
      },
    })
  };

  /**
   * List of sites managed by the user.
   * */
  const userSites = user.map((site) => (
    <li key={site.url}>
      <span>{site.url}</span>
      <Button color="danger" onClick={onRemove(site.url)}>Delete</Button>
    </li>
  ));

  /**
   * Form values in the add site form.
   * */
  interface AddSiteValues extends FormValues {
    url: string;
    apikey: string;
  }

  /**
   * Initial values for the add site form.
   * */
  const addSiteValues = { url: '', apikey: '' };

  /**
   * Callback function to add site after the add site form
   * is submitted.
   * */
  const onAdd: OnSubmitCallback = ({
    url, apikey
  }: AddSiteValues, reset) => {
    reset();
    dispatch({
      sites: {
        type: 'add',
        site: { url, apikey },
      },
    });
  }

  /**
   * Form for adding a site to the collection of sites
   * managed by the user.
   * */
  const addSite: RenderFunction = (
    values: AddSiteValues,
    events
  ) => (
    <Fragment>
      <label htmlFor="url">
        URL
        <input
          type="text"
          name="url"
          id="url"
          placeholder="URL"
          required
          value={values.url}
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
          value={values.apikey}
          {...events}
        />
      </label>
      <Button color="accent" type="submit">Add Site</Button>
    </Fragment>
  );

  return (
    <section className="sites">
      <article className="sites-article sites-add">
        <header className="sites-article-header">
          <h3>Add new site</h3>
        </header>
        <Form
          className="sites-add-form"
          initialValues={addSiteValues}
          onSubmit={onAdd}
          render={addSite}
        />
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
