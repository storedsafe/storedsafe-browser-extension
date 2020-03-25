# storedsafe-browser-extension

StoredSafe browser extension for Chrome and Firefox.

## Setup
[Chrome managed policy templates](https://www.chromium.org/administrators/policy-templates)

[Firefox managed policy templates](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests#Managed_storage_manifests)

## Data Model
  The local storage contains information about the active sessions. It treats logins to different StoredSafe servers as separate sessions, meaning that an inactive session will not have its `lastActive` field updated and subsequently be terminated when the timer since the last active state for that session runs out.

  Settings will be retreived either from managed storage (set by system administrator) or from sync storage.
Managed storage has two different versions of the settings object; `enforced` and `default`.
  Fields in the enforced object will be disabled in sync storage. The defaults object can be used to override the hard coded default values shipped with the extension on a per system basis.

  The sync settings can be used to override the default values either from managed storage or from the hard coded default values that ship with the extension. This storage is meant for customization on a per user basis and will sync automatically across devices if you are logged into the browser on multiple units.
  It should also be possible to merge settings between managed and sync such as saving a username in sync storage for a site defined along with an apikey in managed storage.

### Local Storage
```javascript
{
  sessions: {
    current: [url],
    sessions: {
      [url]: {
        handler: [StoredSafe],
        createdAt: [time],
        lastActive: [time],
      },
      ...
    },
  },
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
    autoFill: [bool],
  },
}
```

### Managed Storage
```javascript
{
  settings: {
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
      maxIdle: [int, minutes],
      autoFill: [bool]
    },
  },
}
```

## Prototype UI
![GIF of login form interaction](graphics/preview_login.gif?raw=true)

## TODO
### WIP
- [ ] Break down UI into React components
  - [x] Login Form
    - [ ] Write tests
  - [ ] Vault List
  - [ ] Save Item
  - [ ] Sessions
- [ ] Connect login form with authentication in StoredSafe API
  - [ ] Handle sessions in background script
  - [ ] Send message to background script or authenticate in popup?

### Upcoming
- [ ] Connect frontend with background scripts
- [ ] Autofill

### Future
- [ ] Remember preferred login type
- [ ] Turn custom checkbox and select into React components

### Completed
- [x] Fixed custom checkbox and select dropdown (25/03)

