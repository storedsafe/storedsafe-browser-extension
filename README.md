# storedsafe-browser-extension

StoredSafe browser extension for Chrome and Firefox.

## Setup
[https://www.chromium.org/administrators/policy-templates](Chrome managed policy templates)
[https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests#Managed_storage_manifests](Firefox managed policy templates)

## Data Model
  The local storage contains information about the current session. It treats logins to different sites as separate sessions, meaning that an inactive session will not have its `lastActive` field updated and subsequently be terminated when the timer for that session runs out.

  Settings will be retreived either from managed storage (set by system administrator) or from sync storage.
Managed storage has two different versions of the settings object; `enforced` and `default`.
  Fields in the enforced object will be disabled in sync storage. The defaults object can be used to override the hard coded default values shipped with the extension on a per system basis.

  The sync settings can be used to override the default values either from managed storage or from the hard coded default values that ship with the extension. This storage is meant for customization on a per user basis and will sync automatically across devices if you are logged into the browser on multiple units.
  It should also be possible to merge settings between managed and sync such as saving a username in sync storage for a site defined along with an apikey in managed storage.

### Local Storage
```javascript
{
  current: [url],
  sessions: {
    [url]: {
      token: [string],
      createdAt: [time],
      lastActive: [time],
    },
    ...
}
```

### Sync Storage
```javascript
{
  settings: {
    sites: {
      [url]: {
        apikey: [string],
        username: [string],
      },
      ...
    },
    maxIdle: [int, minutes],
    maxTokenLife: [int, minutes],
  },
}
```

### Managed Storage
```javascript
{
  enforced: {
    sites: {
      [url]: {
        apikey: [string],
      },
      ...
    },
    maxTokenLife: [int, minutes],
  },
  defaults: {
    maxIdle: 10,
  },
}
```
