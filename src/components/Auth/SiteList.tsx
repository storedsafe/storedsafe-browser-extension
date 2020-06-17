import React from 'react';
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
    {sites.map(({ host }, index) => {
      const session = sessions.get(host);
      const isOnline = session !== undefined;
      return (
        <article
          key={host}
          className={`site-list-entry${isOnline ? ' online' : ''}${index === selected ? ' selected' : ''}`}
          onClick={(): void => onSelect(index)}>
          <p className="site-list-host">{host}</p>
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
