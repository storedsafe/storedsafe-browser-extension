import React from 'react';
import svg from '../../ico/svg';
import './SiteTitle.scss';

interface SiteTitleProps {
  host: string;
  session?: Session;
}

export const SiteTitle: React.FunctionComponent<SiteTitleProps> = ({
  host,
  session,
}: SiteTitleProps) => {
  const isOnline = session !== undefined;
  return (
    <article className={`site-title${isOnline ? ' online' : ''}`}>
      <p className="site-title-host">{host}</p>
      <div className="site-title-icons">
        {isOnline && Object.values(session.warnings).length > 0 && svg.warning}
        {isOnline && Object.values(session.violations).length > 0 && svg.error}
        {isOnline && svg.vaultOpen}
        {!isOnline && svg.vault}
      </div>
    </article>
  );
};
