import React, { useState, useEffect, useCallback } from 'react';
import { actions as StoredSafeActions } from '../../model/storedsafe/StoredSafe';
import { Message } from '../common';
import { AddObject } from '../Add';
import './Add.scss';

export interface AddProps {
  hosts: string[];
  values?: Record<string, string>;
}

const PopupAdd: React.FunctionComponent<AddProps> = ({
  hosts,
  values
}: AddProps) => {
  const [selected, setSelected] = useState<{
    host?: number;
    vault?: number;
    template?: number;
  }>({ host: hosts.length > 0 ? 0 : undefined });
  const [siteInfo, setSiteInfo] = useState<SSSiteInfo>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  const getSiteInfo = useCallback(() => {
    StoredSafeActions.getSiteInfo(hosts[selected.host]).then((siteInfo) => {
      setSiteInfo({
        ...siteInfo,
        vaults: siteInfo.vaults.filter(({ canWrite }) => (
          canWrite
        )),
      });
      setSelected((prevSelected) => ({
        ...prevSelected,
        vault: 0,
        template: siteInfo.templates.findIndex(({ id }) => id === '20') || 0,
      }));
    });
  }, [hosts, selected.host]);

  useEffect(() => {
    getSiteInfo();
  }, [getSiteInfo]);

  const handleHostChange = (id: number): void => {
    setSelected({
      host: id,
    });
  };

  const handleVaultChange = (id: number): void => {
    setSelected((prevState) => ({
      ...prevState,
      vault: id,
    }));
  };

  const handleTemplateChange = (id: number): void => {
    setSelected((prevState) => ({
      ...prevState,
      template: id,
    }));
  };

  const content = <AddObject
    host={{
      selected: selected.host,
      values: hosts,
      onChange: handleHostChange,
    }}
    vault={{
      selected: selected.vault,
      values: siteInfo && siteInfo.vaults,
      onChange: handleVaultChange,
    }}
    template={{
      selected: selected.template,
      values: siteInfo && siteInfo.templates,
      onChange: handleTemplateChange,
    }}
    initialValues={values || {}}
    onAdd={(properties: object): void => {
      properties = {
        ...properties,
        parentid: '0',
        groupid: siteInfo.vaults[selected.vault].id,
        templateid: siteInfo.templates[selected.template].id,
      };
      setLoading(true);
      StoredSafeActions.addObject(hosts[selected.host], properties).then(() => {
        setError(undefined);
      }).catch((error) => {
        setError(error);
      }).then(() => setLoading(false));
    }}
    isLoading={loading}
    error={error}
  />;

  return (
    <section className="popup-add">
      {content}
    </section>
  );
};

export default PopupAdd;
