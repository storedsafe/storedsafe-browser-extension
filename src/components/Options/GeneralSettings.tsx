import React, { useEffect, useState } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { useForm } from '../../hooks/useForm';
import { fields, Settings, SettingsValues } from '../../model/Settings';
import { Button, Checkbox } from '../ui/common';
import './GeneralSettings.scss';

export const GeneralSettings: React.FunctionComponent = () => {
  const { state, dispatch, isInitialized } = useStorage();
  const [values, events, setValues] = useForm<SettingsValues>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (Object.keys(values).length === 0 &&
        Object.keys(state.settings).length > 0) {
      const initialValues: SettingsValues = {};
      Object.keys(state.settings).forEach(
        (field) => initialValues[field] = state.settings[field].value
      );
      setValues(initialValues);
    }
  }, [state, values, setValues]);

  if (!isInitialized) return <p>Loading...</p>;

  // Create form fields
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
      values[field] !== state.settings[field].value ? 'label-altered' : '',
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
          <input
            value={values[field] as string | number}
            {...events}
            {...attributes}
          />
        </label>);
    }
  });

  /**
   * Save settings to storage on submit.
   * */
  const onSave = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setLoading(true);
    const newSettings: Settings = {...state.settings};
    Object.keys(values).forEach((field) => {
      if (!state.settings[field].managed) {
        newSettings[field].value =  values[field];
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
