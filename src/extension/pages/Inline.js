import React from 'react';
import logo from '../../assets/icon.png'
import './Inline.scss'

export default function Inline(props) {
  // const logo = browser.runtime.getURL('/icon.png');

  return (
    <button
      className='storedsafe-inline-button'
      style={{backgroundImage: 'url(' + logo + ')',}}
      onClick={(event) => {
        event.preventDefault();
        console.log('storedsafe click');
      }}
    ></button>
  );
}
