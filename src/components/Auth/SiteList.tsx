import React from 'react';
import { Site } from '../../model/Sites';
import { Sessions } from '../../model/Sessions';
import svg from '../../ico/svg';
import './SiteList.scss';

interface SiteListProps {
  sites: Site[];
  sessions: Sessions;
  selected: number;
  onSelect: (id: number) => void;
}

export const SiteList: React.FunctionComponent<SiteListProps> = ({
  sites,
  sessions,
  selected,
  onSelect,
}: SiteListProps) => (
  <section className="site-list">
    {sites.map(({ url }, index) => {
      const session = sessions[url];
      const isOnline = session !== undefined;
      return (
        <article
          key={url}
          className={`site-list-entry${isOnline ? ' online' : ''}${index === selected ? ' selected' : ''}`}
          onClick={(): void => onSelect(index)}>
          <p className="site-list-url">{url}</p>
          <div className="site-list-icons">
            {isOnline && Object.values(session.warnings).length > 0 && svg.warning}
            {isOnline && Object.values(session.violations).length > 0 && svg.error}
            {isOnline && svg.vaultOpen}
            {!isOnline && svg.vault}
          </div>
        </article>
      );
    })}
  </section>
);
