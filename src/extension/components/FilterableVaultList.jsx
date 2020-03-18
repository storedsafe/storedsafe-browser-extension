import React from 'react';

export default function FilterableVaultList(props) {
  return (
    <section className="list">
      <input type="text" placeholder="Search" />
      <ul>
        <li className="vault">
          My Vault
          <ul>
            <li className="object">
              safe.storedsafe.com
              <ul>
                <li className="field">
                  <span className="key">Username: </span>
                  <span className="value">john.doe@example.com</span>
                </li>
                <li className="field crypted">
                  <span className="key">Passphase: </span>
                  <span className="value">****************</span>
                  <div className="button">Copy</div>
                  <div className="button">Reveal</div>
                </li>
              </ul>
              <li className="object">Safe PIN</li>
              <ul>
                <li className="field crypted">
                  <span className="key">Pin: </span>
                  <span className="value">******</span>
                  <div className="button">Copy</div>
                  <div className="button">Reveal</div>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </section>
  );
}
