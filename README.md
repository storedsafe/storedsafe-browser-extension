# storedsafe-browser-extension

StoredSafe browser extension for Chrome and Firefox.

## Setup

### Install
The `dist` folder contains the latest unpackaged builds for chrome and firefox.
- To install in chrome, go to [](chrome://extensions) and click *Load Unpackaged*. Navigate to the `dist/chrome/` folder and click *open*.
- To install in firefox, go to [](about:debugging) and click *This Firefox* followed by *Load Temporary Add-on...*. Navigate to the `dist/firefox/` folder and click *open*.

### Build
Requires npm or yarn to build. Currently depends on storedsafe-javascript package from this git server which requires an ssh-key to fetch. Future versions will fetch this from a public repository.

```
npm install
npm run build # Production build
npm run build:dev # Development build
npm run build:watch # Continuous development build
```

or

```
yarn
yarn build
... # Same as npm but without run
```

Check package.json for all scripts or use `npx <command>` to use the installed tools directly.

### Managed Storage
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

### Roadmap
- [x] **0.0.0-1**: Authenticate through popup and retrieve token from StoredSafe
- [ ] **0.0.0-2**: Search for items in StoredSafe through popup
- [ ] 0.0.0-3: Reveal/copy decrypted data in popup
- [ ] 0.0.0-4: Find and fill relevant data in StoredSafe for active site from popup
- [ ] 0.0.0-5: Autofill data in StoredSafe for active site
- [ ] 0.0.0-6: Offer to save data after submit

#### WIP
- [ ] UI
  - [x] Login Form
    - [x] Write tests
    - [ ] Handle login errors
  - [ ] Sessions
  - [ ] Settings Page
  - [ ] Loading icon
- [ ] Connect login form with authentication in StoredSafe API
  - [ ] Handle sessions in background script
  - [x] Send message to background script from components

#### Completed
- [x] Wrote tests for previously finished components (27/03)
- [x] Connect frontend with background scripts (27/03)
- [x] Turned inputs into component (26/03)
- [x] Fixed custom checkbox and select dropdown (25/03)

