import React from 'react';
import { Site } from '../../../model/Sites';
import { Sessions } from '../../../model/Sessions';
import svg from '../../../ico/svg';
import './SiteList.scss';

interface SiteListProps {
  sites: Site[];
  sitesStatus: {
    [url: string]: {
      errors: string[];
      warnings: string[];
    };
  };
  sessions: Sessions;
  selected: number;
  onSelect: (id: number) => void;
}

export const SiteList: React.FunctionComponent<SiteListProps> = ({
  sites,
  sessions,
  selected,
  onSelect,
  sitesStatus,
}: SiteListProps) => (
  <section className="site-list">
    {sites.map(({ url }, index) => {
      const isOnline = sessions[url] !== undefined;
      return (
        <article
          key={url}
          className={`site-list-entry${isOnline ? ' online' : ''}${index === selected ? ' selected' : ''}`}
          onClick={(): void => onSelect(index)}>
          <p className="site-url">{url}</p>
          <div className="site-icons">
            {sitesStatus[url].warnings.length > 0 && svg.warning}
            {sitesStatus[url].errors.length > 0 && svg.error}
            {isOnline && svg.vaultOpen}
            {!isOnline && svg.vault}
          </div>
        </article>
      );
    })}
  </section>
);
