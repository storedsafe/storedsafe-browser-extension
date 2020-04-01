import React from 'react';
import Header from '../../components/Header';
import Auth from '../../containers/Auth';
import ObjectList from '../../containers/ObjectList';

export default function Popup() {
  return (
    <div className="popup">
      <Header />
      <Auth>
        <ObjectList key="objectList" />
      </Auth>
    </div>
  );
}
