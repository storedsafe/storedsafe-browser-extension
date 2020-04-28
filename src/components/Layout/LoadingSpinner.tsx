import React from 'react';
import './LoadingSpinner.scss';

interface LoadingSpinnerProps {
  status?: 'loading' | 'success' | 'error' | 'warning';
}

export const LoadingSpinner: React.SFC<LoadingSpinnerProps> = ({
  status,
}: LoadingSpinnerProps) => (
  <div className="loading-spinner">
    <div className={`spinner ${status}`} />
  </div>
);

LoadingSpinner.defaultProps = {
  status: 'loading',
};
