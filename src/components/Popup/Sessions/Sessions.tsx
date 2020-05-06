import React, { useState } from 'react';
import { useStorage } from '../../../state/StorageState';
import { Site } from '../../../model/Sites';
import { Session } from '../../../model/Sessions';
import { OnlineIndicator } from '../../Layout';
import Auth from '../Auth';
import './Sessions.scss';

interface SessionItemProps {
  site: Site;
  session?: Session;
}

const SessionItem: React.FunctionComponent<SessionItemProps> = ({
  site,
  session,
}: SessionItemProps) => {
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const { url } = site;
  const isOnline = session !== undefined;
  const minutesActive = isOnline && Math.floor((Date.now() - session.createdAt) / (1000 * 60));

  return (
    <article className="session-item">
      <button type="button" className="session-item-button" onClick={(): void => setShowAuth(!showAuth)}>
        <span>
          {url}
          {isOnline && minutesActive !== undefined && ` (${minutesActive} min)` || ''}
        </span>
        <OnlineIndicator online={isOnline} />
      </button>
      {showAuth && <Auth url={url} />}
    </article>
  );
};

interface SessionsProps {
  selected: boolean;
  toggleActive: () => void;
}

export const Sessions: React.FunctionComponent<SessionsProps> = ({
  selected,
  toggleActive,
}: SessionsProps) => {
  const [state] = useStorage();

  const numberOfSessions = Object.keys(state.sessions).length;
  let sessionsText = 'No active sessions';

  if (numberOfSessions > 0) {
    sessionsText = `${numberOfSessions} active session${numberOfSessions === 1 ? '' : 's'}`;
  }

  return (
    <section className={`sessions${selected ? ' selected' : ''}`}>
      <article className="sessions-menu">
        {state.sites.list.map((site) => (
          <SessionItem
            key={site.url}
            site={site}
            session={state.sessions[site.url]}
          />
        ))}
      </article>
      <article
        className="sessions-toggle"
        onClick={toggleActive}>
        <div className="sessions-open">
          <span>show/hide sessions</span>
        </div>
        <div className="sessions-status">
          <span>{sessionsText}</span>
          <OnlineIndicator online={numberOfSessions > 0} />
        </div>
      </article>
    </section>
  );
};
