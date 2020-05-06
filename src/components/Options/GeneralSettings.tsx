import React, { Fragment } from 'react';
import { useStorage } from '../../state/StorageState';
import { fields, Settings } from '../../model/Settings';
import { Button } from '../Layout';
import {
  Form,
  Input,
  FormValues,
  RenderFunction,
  OnSubmitCallback,
} from '../Form';
import './GeneralSettings.scss';

export const GeneralSettings: React.FunctionComponent = () => {
  const [state, dispatch] = useStorage();

  if (!state.isInitialized) return <p>Loading...</p>;

  const initialValues: FormValues = {};
  Object.keys(state.settings).forEach(
    (field) => initialValues[field] = state.settings[field].value
  );

  const renderGeneralSettings: RenderFunction = (values, events) => {
    const settingsFields = Object.keys(fields).map((field) => {
      const { label, attributes } = fields[field];
      const disabled = state.settings[field].managed;
      attributes.id = field;
      attributes.name = field;
      attributes.disabled = disabled;
      attributes.title = disabled ? 'This field is managed by your organization' : '';

      const labelClassNames = [
        disabled ? 'label-disabled' : '',
        attributes.type === 'checkbox' ? 'label-checkbox' : '',
      ].join(' ');

      if (attributes.type === 'checkbox') {
          return (
        <label key={field} htmlFor={field} className={labelClassNames}>
          <Input.Checkbox
            checked={values[field] as boolean}
            {...events}
            {...attributes}
          />
          <span>{label}</span>
        </label>);
      } else {
        return (
        <label key={field} htmlFor={field} className={labelClassNames}>
          <span>{label}</span>
          <input
            value={values[field] as string | number}
            {...events}
            {...attributes}
          />
        </label>);
      }
    });

    return (
      <Fragment>
        {settingsFields}
        <Button type="submit">Save</Button>
      </Fragment>
    );
  };

  const onSave: OnSubmitCallback = (values) => {
    const newSettings: Settings = {...state.settings};
    Object.keys(values).forEach((field) => {
      if (!state.settings[field].managed) {
        newSettings[field].value =  values[field] as string | number | boolean;
      }
    });

    dispatch({
      settings: {
        type: 'set',
        settings: newSettings,
      }
    });
  };

  return (
    <section className="general-settings">
      <article className="general-settings-article">
        <Form
          className="general-settings-form"
          initialValues={initialValues}
          onSubmit={onSave}
          render={renderGeneralSettings}
        />
      </article>
    </section>
  );
};
