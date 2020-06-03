import React  from 'react';
import { Session } from '../../model/Sessions';
import { Button, Message } from '../common';
import './SiteStatus.scss';

export type OnLogoutCallback = (url: string) => void;

interface SiteStatusProps {
  url: string;
  session: Session;
  onLogout: OnLogoutCallback;
}

export const SiteStatus: React.FunctionComponent<SiteStatusProps> = ({
  url,
  session,
  onLogout,
}: SiteStatusProps) => {
  const warningMessages = (
    <article className="site-status-warnings">
      <h3 className="warnings-title">Warnings</h3>
      { Object.values(session.warnings).map((warning, index) => (
        <Message key={index} type="warning">{warning}</Message>
      ))}
    </article>
  );
  const errorMessages = (
    <article className="site-status-errors">
      <h3 className="errors-title">Violations</h3>
      {Object.values(session.violations).map((error, index) => (
        <Message key={index} type="error">{error}</Message>
      ))}
    </article>
  );

  const minutesActive = Math.floor((Date.now() - session.createdAt) / (1000 * 60));
  const dateStamp = new Date(session.createdAt).toLocaleTimeString('sv');

  return (
    <section className="site-status">
      <section className="site-status-info">
        <article className="site-status-online">
          <h3>Session status</h3>
          <p className="site-status-active">Online since {dateStamp} ({minutesActive} minutes).</p>
        </article>
        {Object.values(session.violations).length > 0 && (errorMessages)}
        {Object.values(session.warnings).length > 0 && (warningMessages)}
      </section>
      <section className="site-status-logout">
        <Button
          type="submit"
          color="danger"
          onClick={(): void => onLogout(url)}>
          Logout
        </Button>
      </section>
    </section>
  );
};
