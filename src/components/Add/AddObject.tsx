import React from 'react';
import { Select, Button, Message } from '../common';
import { useForm } from '../../hooks/useForm';
import './AddObject.scss';

export type OnAddCallback = (params: object) => void;
export type OnPropertyChangeCallback = (id: number) => void;

export interface AddObjectProperty<T> {
  selected?: number;
  values: T[];
  onChange: OnPropertyChangeCallback;
}

type GetOptionValues<T> = (value: T) => {
  key: string;
  title: string;
};

function PropertySelector <T>(
  property: AddObjectProperty<T>,
  label: string,
  getOptionValues: GetOptionValues<T>,
): React.ReactNode {
  const hasProperty = (property && property.values) !== undefined;
  const onSelectProperty = ({
    target
  }: React.ChangeEvent<HTMLSelectElement>): void => {
    property.onChange(Number(target.value));
  };

  return !hasProperty || (hasProperty && property.values.length > 1) ? (
    <label htmlFor="vault">
      <span>{label}</span>
      <Select
        id={label}
        value={property.selected}
        onChange={onSelectProperty}
        disabled={!hasProperty}>
        {hasProperty && property.values.map((value, id) => {
          const { key, title } = getOptionValues(value);
          return (
            <option key={key} value={id}>{title}</option>
          );
        })}
      </Select>
    </label>
  ) : null;
}

interface AddObjectProps {
  host: AddObjectProperty<string>;
  vault?: AddObjectProperty<SSVault>;
  template?: AddObjectProperty<SSTemplate>;
  onAdd: OnAddCallback;
  initialValues: Record<string, string>;
  isLoading: boolean;
  error?: Error;
}

export const AddObject: React.FunctionComponent<AddObjectProps> = ({
  host,
  vault,
  template,
  onAdd,
  initialValues,
  isLoading,
  error,
}: AddObjectProps) => {
  const hostSelector = PropertySelector<string>(
    host, 'Site', (host) => ({ key: host, title: host })
  );
  const vaultSelector = PropertySelector<SSVault>(
    vault, 'Vault', (vault) => ({ key: vault.id, title: vault.name })
  );
  const templateSelector = PropertySelector<SSTemplate>(
    template, 'Template', (template) => ({ key: template.id, title: template.name })
  );

  const [values, events] = useForm<Record<string, string>>(initialValues);

  const onSubmit = ((event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onAdd(values);
  });

  const hasTemplate = (template && template.selected) !== undefined;
  const structure = hasTemplate &&
    template.values[template.selected].structure;
  const fields = structure && structure.map(({ title, name, isEncrypted, type }) => (
    <label key={name} htmlFor={name} className="add-object-field">
      <span>{title}</span>
      <input
        className={`add-object-field${isEncrypted ? ' encrypted' : ''}`}
        type={type === 'text-passwdgen' ? 'password' : 'text'}
        id={name}
        name={name}
        value={values[name] || ''}
        {...events}
      />
    </label>
  )) || null;

  return (
    <section className="add-object">
      {hostSelector}
      {vaultSelector}
      {templateSelector}
      <form onSubmit={onSubmit} className="add-object-form">
        {fields}
        {fields && (
          <Button type="submit" color="accent" isLoading={isLoading}>
            Add to StoredSafe
          </Button>
        )}
      </form>
      {error && <Message type="error">{error.message}</Message>}
    </section>
  );
};
