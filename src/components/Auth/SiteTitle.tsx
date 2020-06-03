import React from 'react';
import { Session } from '../../model/Sessions';
import svg from '../../ico/svg';
import './SiteTitle.scss';

interface SiteTitleProps {
  url: string;
  session?: Session;
}

export const SiteTitle: React.FunctionComponent<SiteTitleProps> = ({
  url,
  session,
}: SiteTitleProps) => {
  const isOnline = session !== undefined;
  return (
    <article className={`site-title${isOnline ? ' online' : ''}`}>
      <p className="site-title-url">{url}</p>
      <div className="site-title-icons">
        {isOnline && Object.values(session.warnings).length > 0 && svg.warning}
        {isOnline && Object.values(session.violations).length > 0 && svg.error}
        {isOnline && svg.vaultOpen}
        {!isOnline && svg.vault}
      </div>
    </article>
  );
};
