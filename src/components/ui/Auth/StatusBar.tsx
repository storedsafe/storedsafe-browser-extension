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
      {activeSessions === 0 && 'No active sessions'}
      {activeSessions === 1 && '1 active session'}
      {activeSessions >= 2 && `${activeSessions} active sessions`}
    </span>
  </section>
);
