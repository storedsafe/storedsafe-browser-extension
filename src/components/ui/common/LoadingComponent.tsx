import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import './LoadingComponent.scss';

export const LoadingComponent: React.FunctionComponent = () => (
  <div className="loading-component">
    <LoadingSpinner />
  </div>
);
