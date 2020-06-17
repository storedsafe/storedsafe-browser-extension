import React, { useState } from 'react';
import { Message } from '../common';
import { AddObject } from '../Add';
import './Add.scss';

export interface AddProps {
  hosts: string[];
  vaults?: SSVault[];
  templates?: SSTemplate[];
  onHostChange: (host: string) => void;
}

const PopupAdd: React.FunctionComponent<AddProps> = ({
  hosts,
  vaults,
  templates,
  onHostChange,
}: AddProps) => {
  const [state, setState] = useState<{
    host?: number;
    vault?: number;
    template?: number;
  }>({});

  const handleHostChange = (id: number): void => {
    setState({ host: id });
    onHostChange(hosts[id]);
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

  const content = <AddObject
    host={{
      selected: state.host,
      values: hosts,
      onChange: handleHostChange,
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

  return (
    <section className="popup-add">
      {content}
      <Message type="warning">Section currently under development.</Message>
    </section>
  );
};

export default PopupAdd;
