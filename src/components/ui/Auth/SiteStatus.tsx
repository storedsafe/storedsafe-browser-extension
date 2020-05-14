import React  from 'react';
import { Session } from '../../../model/Sessions';
import { Button, Message } from '../common';
import './SiteStatus.scss';

interface SiteStatusProps {
  url: string;
  session: Session;
  onLogout: () => void;
}

export const SiteStatus: React.FunctionComponent<SiteStatusProps> = ({
  url,
  session,
  onLogout,
}: SiteStatusProps) => {
  const warningMessages = (
    <article className="site-status-warnings">
      <h3 className="warnings-title">Warnings</h3>
      { session.warnings.map((warning, index) => (
        <Message key={index} type="warning">{warning}</Message>
      ))}
    </article>
  );
  const errorMessages = (
    <article className="site-status-errors">
      <h3 className="errors-title">Violations</h3>
      {session.errors.map((error, index) => (
        <Message key={index} type="error">{error}</Message>
      ))}
    </article>
  );

  const minutesActive = Math.floor((Date.now() - session.createdAt) / (1000 * 60));
  const dateStamp = new Date(session.createdAt).toLocaleTimeString('sv');

  return (
    <section className="site-status">
      <h2>{url}</h2>
      <section className="site-status-info">
        <article className="site-status-online">
          <h3>Session status</h3>
          <p className="site-status-active">Online since {dateStamp} ({minutesActive} minutes).</p>
        </article>
        {session.warnings.length > 0 && (warningMessages)}
        {session.errors.length > 0 && (errorMessages)}
      </section>
      <section className="site-status-logout">
        <Button type="submit" color="danger" onClick={onLogout}>Logout</Button>
      </section>
    </section>
  );
};
