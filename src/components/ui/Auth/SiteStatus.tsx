import React  from 'react';
import { Button, Message } from '../common';
import './SiteStatus.scss';

interface SiteStatusProps {
  url: string;
  warnings: string[];
  errors: string[];
  createdAt: number;
  onLogout: () => void;
}

export const SiteStatus: React.FunctionComponent<SiteStatusProps> = ({
  url,
  warnings,
  errors,
  createdAt,
  onLogout,
}: SiteStatusProps) => {
  const warningMessages = (
    <article className="site-status-warnings">
      <h3 className="warnings-title">Warnings</h3>
      { warnings.map((warning, index) => (
        <Message key={index} type="warning">{warning}</Message>
      ))}
    </article>
  );
  const errorMessages = (
    <article className="site-status-errors">
      <h3 className="errors-title">Errors</h3>
      {errors.length === 0 && <p>No errors found.</p>}
      {errors.map((error, index) => (
        <Message key={index} type="error">{error}</Message>
      ))}
    </article>
  );

  const minutesActive = Math.floor((Date.now() - createdAt) / (1000 * 60));
  const dateStamp = new Date(createdAt).toLocaleTimeString('sv');

  return (
    <section className="site-status">
      <h2>{url}</h2>
      <section className="site-status-info">
        <article className="site-status-online">
          <h3>Session status</h3>
          <p className="site-status-active">Online since {dateStamp} ({minutesActive} minutes).</p>
        </article>
        {warnings.length > 0 && (warningMessages)}
        {errors.length > 0 && (errorMessages)}
      </section>
      <section className="site-status-logout">
        <Button type="submit" color="danger" onClick={onLogout}>Logout</Button>
      </section>
    </section>
  );
};
