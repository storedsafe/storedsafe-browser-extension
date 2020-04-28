import React, { useState, useEffect } from 'react';
import { useStorage } from '../../state/StorageState';
import { Card, Collapsible } from '../Layout';
import { SessionManager, SessionManagerPreview } from '../SessionManager';
import Auth from '../Auth';
import Search from '../Search';
import './Popup.scss';

import { StoredSafeObject, StoredSafeTemplate } from 'storedsafe';
import { VaultObject } from '../Layout';

const ssObject: StoredSafeObject = {
  "id": "490",
  "parentid": "0",
  "templateid": "1",
  "groupid": "179",
  "status": "128",
  "objectname": "firewall.za.example.com",
  "filename": "",
  "children": "0",
  "notes": "false",
  "tags": "",
  "alarmed": "false",
  "public": {
    "host": "firewall.za.example.com",
    "username": "root",
    "info": "The pfSense fw protecting the ZA branch."
  }
};

const ssTemplate: StoredSafeTemplate = {
  "INFO": {
    "id": "1",
    "name": "Server",
    "ico": "server",
    "active": true,
    "wb": true
  },
  "STRUCTURE": {
    "host": {
      "translation": "Host / IP",
      "type": "text",
      "encrypted": false,
      "show": true,
      "policy": false,
      "alarm": false,
      "opt": false,
      "cc": false,
      "nc": false
    },
    "username": {
      "translation": "Username",
      "type": "text",
      "encrypted": false,
      "show": true,
      "policy": false,
      "alarm": false,
      "opt": false,
      "cc": false,
      "nc": false
    },
    "password": {
      "translation": "Password",
      "type": "text-passwdgen",
      "encrypted": true,
      "show": true,
      "policy": true,
      "alarm": true,
      "opt": false,
      "cc": true,
      "nc": true
    },
    "info": {
      "translation": "Information",
      "type": "textarea",
      "encrypted": false,
      "show": true,
      "policy": false,
      "alarm": false,
      "opt": true,
      "cc": false,
      "nc": false
    },
    "cryptedinfo": {
      "translation": "Sensitive info",
      "type": "textarea",
      "encrypted": true,
      "show": false,
      "policy": false,
      "alarm": false,
      "opt": true,
      "cc": false,
      "nc": false
    }
  }
};

export const Popup: React.FC = () => {
  const [state] = useStorage();
  const [managingSessions, setManagingSessions] = useState<boolean>(true);

  useEffect(() => {
    if (Object.keys(state.sessions).length === 0) {
      setManagingSessions(true);
    } else {
      setManagingSessions(false);
    }
  }, [state]);

  return (
    <section className="popup">
      <Card>
        <Collapsible collapsed={managingSessions}>
          <div className="popup-search">
            <input type="search" className="popup-search-input" />
            <button className="popup-search-button">Search</button>
          </div>
          <VaultObject ssObject={ssObject} ssTemplate={ssTemplate} />
        </Collapsible>
        <Collapsible collapsed={!managingSessions}>
          <SessionManager />
        </Collapsible>
      </Card>
      <SessionManagerPreview onClick={(): void => setManagingSessions(!managingSessions)} />
    </section>
  );
};
