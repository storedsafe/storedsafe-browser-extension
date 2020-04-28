import React from 'react';
import './OnlineIndicator.scss';

interface OnlineIndicatorProps {
  online: boolean;
}

export const OnlineIndicator: React.SFC<OnlineIndicatorProps> = ({
  online,
}: OnlineIndicatorProps) => (
  <div className={`online-indicator ${online ? 'online' : 'offline'}`} />
);
