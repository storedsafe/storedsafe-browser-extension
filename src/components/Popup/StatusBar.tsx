import React from 'react';
import { OnlineIndicator } from '../common';
import './StatusBar.scss';

interface StatusBarProps {
  activeSessions: number;
}

export const StatusBar: React.FunctionComponent<StatusBarProps> = ({
  activeSessions
}: StatusBarProps) => (
  <section className="status-bar">
    <OnlineIndicator online={activeSessions > 0} />
    <span className="status-bar-sessions">
      {activeSessions === 0 && 'Offline'}
      {activeSessions === 1 && 'Online'}
      {activeSessions >= 2 && `${activeSessions} active sessions`}
    </span>
  </section>
);
