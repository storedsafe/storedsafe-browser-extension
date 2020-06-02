import React, { useState } from 'react';
import { Vault, Template } from '../../model/StoredSafe';
import { LoadingComponent } from '../common';
import { AddObject } from '../Add';
import './Add.scss';

export interface AddProps {
  urls: string[];
  vaults?: Vault[];
  templates?: Template[];
  onUrlChange: (url: string) => void;
}

const PopupAdd: React.FunctionComponent<AddProps> = ({
  urls,
  vaults,
  templates,
  onUrlChange,
}: AddProps) => {
  const [state, setState] = useState<{
    url?: number;
    vault?: number;
    template?: number;
  }>({});

  const handleUrlChange = (id: number): void => {
    setState({ url: id });
    onUrlChange(urls[id]);
  };

  const handleVaultChange = (id: number): void => {
    setState((prevState) => ({
      ...prevState,
      vault: id,
    }));
  };

  const handleTemplateChange = (id: number): void => {
    setState((prevState) => ({
      ...prevState,
      template: id,
    }));
  };

  const left = <AddObject
    url={{
      selected: state.url,
      values: urls,
      onChange: handleUrlChange,
    }}
    vault={{
      selected: state.vault,
      values: vaults,
      onChange: handleVaultChange,
    }}
    template={{
      selected: state.template,
      values: templates,
      onChange: handleTemplateChange,
    }}
  />;

  const right: React.ReactNode = <p>Implementation still in progress.</p>;

  return (
    <section className="popup-add content">
      <article>{left}</article>
      <article>{right}</article>
    </section>
  );
};

export default PopupAdd;
