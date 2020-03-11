import React from 'react';
import './Inject.scss';

export default function Inject(props) {
  const logo = browser.runtime.getURL('/icon.png');

  return (
    <button
      className='storedsafe-inject-button'
      style={{backgroundImage: 'url(' + logo + ')',}}
      onClick={(event) => {
        event.preventDefault();
        console.log('storedsafe click');
      }}
    ></button>
  );
}
