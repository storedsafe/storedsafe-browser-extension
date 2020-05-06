import React, { useState, useEffect } from 'react';
import { useStorage } from '../../state/StorageState';
import Search from './Search';
import Sessions from './Sessions';
import { Toolbar } from './Toolbar';
import './PopupMain.scss';

export const PopupMain: React.FunctionComponent = () => {
  const [state] = useStorage();
  const [active, setActive] = useState<'search' | 'sessions'>('search');

  useEffect(() => {
    if (state.isInitialized) {
      setActive(Object.keys(state.sessions).length > 0 ? 'search' : 'sessions');
    }
  }, [state]);

  return (
    <section className="popup-main">
      <div className="popup-main-accordion">
        <Search
          selected={active === 'search'}
          setActive={(): void => setActive('search')}
        />
        <Sessions
          selected={active === 'sessions'}
          toggleActive={(): void => setActive(active === 'sessions' ? 'search' : 'sessions')}
        />
      </div>
      <Toolbar />
    </section>
  );
};
