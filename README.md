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
- Able to adjust and store settings via interface or managed storage manifest (currently only for illustrative purposes).
- Able to view the new interface in storybook with example data (`yarn storybook` or `npm run storybook` to start storybook server).

### In progress
- Create container components (controllers for interface components) to implement the new interface in the actual extension.

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
