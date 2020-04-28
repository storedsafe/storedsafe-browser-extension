import React from 'react';
import { useStorage } from '../../state/StorageState';
import { SettingsForm, SitesForm } from '../Settings/';
import { Card } from '../Layout';
import './Welcome.scss';

export const Welcome: React.FC = () => {
  const [state] = useStorage();
  return (
    <section className="welcome">
      <Card>
        {!state.isInitialized && <p>Loading...</p>}
        {state.isInitialized && (
          <React.Fragment>
            <SitesForm />
            <SettingsForm />
          </React.Fragment>
        )}
      </Card>
    </section>
  );
}
