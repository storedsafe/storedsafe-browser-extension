import * as React from 'react';
import { StoredSafeObject, StoredSafeTemplate } from 'storedsafe';
import { VaultObject } from '../components/Layout';

export default {
  title: 'StoredSafe',
  component: VaultObject,
};

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

export const Default: React.FC = () => (
  <VaultObject ssObject={ssObject} ssTemplate={ssTemplate} />
);
