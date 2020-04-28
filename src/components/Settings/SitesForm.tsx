import React from 'react';
import { Site } from '../../model/Sites';
import { Message } from '../Layout';
import { useStorage } from '../../state/StorageState';
import * as Form from '../Form';

export const SitesForm: React.FC = () => {
  const [state, dispatch] = useStorage();

  if (!state.isInitialized) {
    return <Message type="info">Loading...</Message>;
  }

  const onRemove: Form.OnSubmitCallback = (values) => {
    const id = values.index as number;
    dispatch({ sites: { type: 'remove', id }});
  };

  const onAdd: Form.OnSubmitCallback = (values) => {
    const site: Site = {
      url: values.url as string,
      apikey: values.apikey as string,
    };
    dispatch({ sites: { type: 'add', site }});
  };

  return (
    <section className="sites-form">
      <h3>Sites</h3>
      {state.sites.collections.system.map((site, index) => (
        <Form.Form
          key={index}
          initialValues={{ ...site, index }}
          handleSubmit={onRemove}
          render={(values): React.ReactNode => (
            <React.Fragment>
              <Form.Field
                type="text"
                name={`system-url-${index}`}
                label="URL"
                value={values.url}
                disabled={true}
              />
              <Form.Field
                type="apikey"
                name={`system-apikey-${index}`}
                label="API Key"
                value={values.apikey}
                disabled={true}
              />
            </React.Fragment>
          )} />
        ))}
      {state.sites.collections.user.map((site, index) => (
        <Form.Form
          key={index}
          initialValues={{ ...site, index }}
          handleSubmit={onRemove}
          render={(values): React.ReactNode => (
            <React.Fragment>
              <Form.Field
                type="text"
                name={`user-url-${index}`}
                label="URL"
                value={values.url}
                disabled={true}
              />
              <Form.Field
                type="apikey"
                name={`user-apikey-${index}`}
                label="API Key"
                value={values.apikey}
                disabled={true}
              />
              <input name="index" type="hidden" value={index} />
              <Form.Field name={`remove-${index}`} label="Delete" type="submit" />
            </React.Fragment>
          )} />
        ))}
        <Form.Form
          handleSubmit={onAdd}
          render={(values, onChange): React.ReactNode => (
            <React.Fragment>
              <Form.Field
                type="text"
                name="url"
                label="URL"
                value={values.url}
                onChange={onChange}
              />
              <Form.Field
                type="apikey"
                name="apikey"
                label="API Key"
                value={values.apikey}
                onChange={onChange}
              />
              <Form.Field name="addSites" label="Add Site" type="submit" />
            </React.Fragment>
          )} />
        {state.isLoading && <Message type="info">Loading...</Message>}
        {state.hasError && (
          <Message type="error">
            Error: {state.error && state.error.toString()}
          </Message>
        )}
      </section>
  );
}
