import React, { useState } from 'react';
import { Settings, Fields } from '../../model/Settings';
import { Message } from '../Layout';
import { useStorage } from '../../state/StorageState';
import * as Form from '../Form';

export const SettingsForm: React.FC = () => {
  const [{ settings, ...state }, dispatch] = useStorage();
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);

  if (!state.isInitialized) {
    return <Message type="info">Loading...</Message>;
  }

  const initialValues: Form.FormValues = {};
  Object.keys(settings).forEach((field) => (
    initialValues[field] = settings[field].value
  ));

  const handleChange: Form.OnChangeCallback = () => {
    setUnsavedChanges(true);
  };

  const handleSubmit: Form.OnSubmitCallback = (values) => {
    const newSettings: Settings = {};
    Object.keys(values).forEach((field) => {
      if (
        (settings[field] === undefined) ||
        (settings[field] && settings[field].managed === false)
      ) {
        newSettings[field] = { value: values[field], managed: false };
      }
    });
    dispatch({ settings: { type: 'set', settings: newSettings }});
    setUnsavedChanges(false);
  };

  return (
    <React.Fragment>
      <h3>Settings</h3>
      <Form.Form
        initialValues={initialValues}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        render={(values, onChange): React.ReactNode => (
          <React.Fragment>
            {Object.keys(Fields).map((field) => {
              const value = (
                Fields[field].attributes.type === 'checkbox'
                  ? { checked: values[field] as boolean }
                  : { value: values[field] as string | number | string[] }
              );
              return (
                <Form.Field
                  key={field}
                  name={field}
                  label={Fields[field].label}
                  onChange={onChange}
                  disabled={settings[field].managed}
                  { ...value }
                  { ...Fields[field].attributes }
                />
                );
            })}
            <Form.Field name="saveSettings" label="save" type="submit" />
          </React.Fragment>
        )} />
      {unsavedChanges && <Message type="warning">Unsaved changes</Message>}
      {state.isLoading && <Message type="info">Loading...</Message>}
      {state.hasError && (
        <Message type="error">
          Error: {state.error && state.error.toString()}
        </Message>
      )}
    </React.Fragment>
  );
}
