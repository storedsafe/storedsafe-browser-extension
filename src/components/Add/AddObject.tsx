import React from 'react';
import { Select } from '../common';
import './AddObject.scss';

export type OnAddCallback = (params: object) => void;
export type OnPropertyChangeCallback = (id: number) => void;

export interface AddObjectProperty<T> {
  selected?: number;
  values: T[];
  onChange: OnPropertyChangeCallback;
}

interface AddObjectProps {
  host: AddObjectProperty<string>;
  vault?: AddObjectProperty<SSVault>;
  template?: AddObjectProperty<SSTemplate>;
}

export const AddObject: React.FunctionComponent<AddObjectProps> = ({
  host,
  vault,
  template,
}: AddObjectProps) => {
  const onSelectHost = ({
    target
  }: React.ChangeEvent<HTMLSelectElement>): void => {
    host.onChange(Number(target.value));
  };

  const onSelectVault = ({
    target
  }: React.ChangeEvent<HTMLSelectElement>): void => {
    vault.onChange(Number(target.value));
  };

  const onSelectTemplate = ({
    target
  }: React.ChangeEvent<HTMLSelectElement>): void => {
    template.onChange(Number(target.value));
  };

  const sites = host.values.length > 1 ? (
    <label htmlFor="host">
      <span>Site</span>
      <Select
        id="host"
        value={host.selected}
        onChange={onSelectHost}>
        <option value={undefined}>Choose site...</option>
        {host.values.map((host, id) => (
          <option key={host} value={id}>{host}</option>
        ))}
      </Select>
    </label>
  ) : null;

  const hasVaults = (vault && vault.values) !== undefined;
  const vaults = !hasVaults || (hasVaults && vault.values.length > 1) ? (
    <label htmlFor="vault">
      <span>Vault</span>
      <Select
        id="vault"
        value={vault.selected}
        onChange={onSelectVault}
        disabled={!hasVaults}>
        <option value={undefined}>Choose vault...</option>
        {hasVaults && vault.values.map(({
          id: vaultId,
          name,
        }, id) => (
          <option key={vaultId} value={id}>{name}</option>
        ))}
      </Select>
    </label>
  ) : null;

  const hasTemplates = (template && template.values) !== undefined;
  const templates = !hasTemplates || (hasTemplates && template.values.length > 1) ? (
    <label htmlFor="template">
      <span>Template</span>
      <Select
        id="template"
        value={template.selected}
        onChange={onSelectTemplate}
        disabled={!hasTemplates}>
        <option value={undefined}>Choose template...</option>
        {hasTemplates && template.values.map(({
          id: templateId,
          name,
        }, id) => (
          <option key={templateId} value={id}>{name}</option>
        ))}
      </Select>
    </label>
  ) : null;

  return (
    <section className="add-object">
      {sites}
      {vaults}
      {templates}
    </section>
  );
};
