import React from 'react';
import { Select } from '../common';
import { Vault, Template } from '../../model/StoredSafe';
import './AddObject.scss';

export type OnPropertyChangeCallback = (id: number) => void;

interface AddObjectProperty<T> {
  selected?: number;
  values: T[];
  onChange: OnPropertyChangeCallback;
}

interface AddObjectProps {
  url: AddObjectProperty<string>;
  vault?: AddObjectProperty<Vault>;
  template?: AddObjectProperty<Template>;
}

export const AddObject: React.FunctionComponent<AddObjectProps> = ({
  url,
  vault,
  template,
}: AddObjectProps) => {
  const onSelectUrl = ({
    target
  }: React.ChangeEvent<HTMLSelectElement>): void => {
    url.onChange(Number(target.value));
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

  const sites = (
    <label htmlFor="url">
      <span>Site</span>
      <Select
        id="url"
        value={url.selected}
        onChange={onSelectUrl}>
        <option value={undefined}>Choose site...</option>
        {url.values.map((url, id) => (
          <option key={url} value={id}>{url}</option>
        ))}
      </Select>
    </label>
  );

  const hasVaults = (vault && vault.values) !== undefined;
  const vaults = (
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
          title
        }, id) => (
          <option key={vaultId} value={id}>{title}</option>
        ))}
      </Select>
    </label>
  );

  const hasTemplates = (template && template.values) !== undefined;
  const templates = (
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
          title
        }, id) => (
          <option key={templateId} value={id}>{title}</option>
        ))}
      </Select>
    </label>
  );

  return (
    <section className="add-object">
      {sites}
      {vaults}
      {templates}
    </section>
  );
};
