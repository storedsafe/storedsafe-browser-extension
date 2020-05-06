# storedsafe-browser-extension

StoredSafe browser extension for Chrome and Firefox.

## Setup

### Install
**Note: These instructions are intended for use during development and do not necessarily reflect the recommended install procedures in production.**

The `dist` folder contains the latest unpackaged builds for chrome and firefox.
- To install in chrome, go to [chrome://extensions](chrome://extensions) and click *Load Unpackaged*. Navigate to the `dist/` folder and click *open*.
  - To use managed storage with chrome, replace the key `<addon-id>` in the chrome managed storage manifest file `managed_storage/policy.json` to match the id given to the extension in [chrome://extensions](chrome://extensions) and then follow the instructions on where to place the manifest at [https://www.chromium.org/administrators/policy-templates](https://www.chromium.org/administrators/policy-templates).
- To install in firefox, go to [about:debugging](about:debugging) and click *This Firefox* followed by *Load Temporary Add-on...*. Navigate to the `dist/` folder and click *open*.
  - To use managed storage with firefox, copy the firefox managed storage manifest file from `managed_storage/addon@storedsafe.com.json` and place it in the place described at [Firefox managed policy templates](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests#Managed_storage_manifests).

### Current Features
- Able to login, automatically remembers login type used and option to save username.
- Able to adjust max token life and max idle time through settings page to invalidate sessions after a total amount of time or after being idle for a certain period of time.
- Able to add/remove sites (url+apikey) that are available for login through settings page.
- Able to search through all vaults that currently have active sessions.
- Able to right click any input field to open popup from the context menu and automatically search for the url of the page where the context menu was opened.
- Able to fill username and password fields on any page with fields matching the matchers in `src/content_script.ts`.

### Build
Requires npm or yarn to build. Currently depends on storedsafe-javascript package from this git server which requires an ssh-key to fetch. Future versions will fetch this from a public repository.

```
yarn
yarn build  # Production build
yarn dev    # Development build
yarn watch  # Continous development build
```

or

```
npm install
npm run build
# ... same as yarn but prefixed with run
```

Check package.json for all scripts or use `yarn <command>` to use the installed tools directly.
