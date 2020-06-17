import React, { useEffect, useState } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { useForm } from '../../hooks/useForm';
import { fields, SettingsValues } from '../../model/storage/Settings';
import { Button, Checkbox } from '../common';
import './GeneralSettings.scss';

export const GeneralSettings: React.FunctionComponent = () => {
  const { state, dispatch, isInitialized } = useStorage();
  const [values, events, setValues] = useForm<SettingsValues>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (Object.keys(values).length === 0 && state.settings.size > 0) {
      const initialValues: SettingsValues = {};
      for (const [field, { value }] of state.settings) {
        initialValues[field] = value;
      }
      setValues(initialValues);
    }
  }, [state, values, setValues]);

  if (!isInitialized) return <p>Loading...</p>;

  // Create form fields
  const settingsFields = Object.keys(fields).map((field) => {
    const { label, unit, attributes } = fields[field];
    const disabled = state.settings.get(field).managed;
    attributes.id = field;
    attributes.name = field;
    attributes.disabled = disabled;
    attributes.title = disabled ? 'This field is managed by your organization' : '';
    const labelClassNames = [
      disabled ? 'label-disabled' : '',
      attributes.type === 'checkbox' ? 'label-checkbox' : '',
      values[field] !== state.settings.get(field).value ? 'label-altered' : '',
    ].join(' ');

    if (attributes.type === 'checkbox') {
      return (
        <label key={field} htmlFor={field} className={labelClassNames}>
          <Checkbox
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
          <div className="general-settings-input">
            <input
              value={values[field] as string | number}
              {...events}
              {...attributes}
            />
            <span>{unit}</span>
          </div>
        </label>);
    }
  });

  /**
   * Save settings to storage on submit.
   * */
  const onSave = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setLoading(true);
    const newSettings: Settings = new Map(state.settings);
    Object.keys(values).forEach((field) => {
      if (!state.settings.get(field).managed) {
        newSettings.get(field).value =  values[field];
      }
    });
    dispatch({
      settings: {
        type: 'update',
        settings: newSettings,
      }
    }, {
      onSuccess: () => setLoading(false)
    });
  };

  return (
    <section className="general-settings">
      <article className="general-settings-article">
        <form className="general-settings-form" onSubmit={onSave}>
          {settingsFields}
          <Button type="submit" isLoading={loading}>Save</Button>
        </form>
      </article>
    </section>
  );
};
