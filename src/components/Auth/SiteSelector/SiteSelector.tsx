import * as React from 'react';
import { useStorage } from '../../../state/StorageState';
import { Field, Option, OnChangeCallback } from '../../Form';
import { Site } from '../../../model/Sites';
import { Sessions } from '../../../model/Sessions';

export interface SiteSelectorProps {
  sites: Site[];
  sessions: Sessions;
  value: number;
}
export const SiteSelector: React.SFC = () => {
  const [state, dispatch] = useStorage();

  const sites = state.sites.list;
  const sessions = state.sessions;
  const selected = state.authState.selected;
  const onChange: OnChangeCallback = (url: string) => {
    dispatch({ authState: { type: 'setSelected', url } });
  };

  const options: Option[] = sites.map((site) => ({
    title: `${sessions[site.url] !== undefined ? '[*] ' : ''}${site.url}`,
    value: site.url,
  }));

  return (
    <Field
      type="select"
      name="site"
      label="Site"
      value={selected}
      onChange={onChange}
      options={options} />
  );
};
