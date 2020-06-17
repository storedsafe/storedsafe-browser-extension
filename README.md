# storedsafe-browser-extension

StoredSafe browser extension for Chrome and Firefox.

**NOTE: Ändringar i strukturen i browser storage, klicka den nya knappen "Clear all data" i options ifall något ser fel ut.**
**NOTE: Nuvarande version är endast kompatibel med StoredSafe 2.1.0**

## Setup

### Install
**Note: These instructions are intended for use during development and do not necessarily reflect the recommended install procedures in production.**

The `dist` folder contains the latest unpackaged builds for chrome and firefox.
- To install in chrome, go to [chrome://extensions](chrome://extensions) and click *Load Unpackaged*. Navigate to the `dist/chrome` folder and click *open*.
  - To use managed storage with chrome, replace the key `<addon-id>` in the chrome managed storage manifest file `managed_storage/policy.json` to match the id given to the extension in [chrome://extensions](chrome://extensions) and then follow the instructions on where to place the manifest at [https://www.chromium.org/administrators/policy-templates](https://www.chromium.org/administrators/policy-templates).
- To install in firefox, go to [about:debugging](about:debugging) and click *This Firefox* followed by *Load Temporary Add-on...*. Navigate to the `dist/firefox` folder and click *open*.
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

### Changelog
- **2020-06-17**
  - Early implementation of add object feature.
    - Able to add objects to StoredSafe through the popup.
    - Popup opens with provided form data after a form is submitted.
  - Finished refactor.
    - Changed object types to map types where it was appropriate for easier interaction with data.
    - Changed some field names for consistency and clarity.
    - Increased comment coverage.
    - Promise reducers now return functions of previous state when they need to depend on previous state for increased stability (avoid data race).
    - Split StoredSafe model into handler files for better cohesion and increased readability.
- **2020-06-11**
  - Removed logout on screen lock (type definition for locked flag is missing in firefox repository which definitely-typed definitions for browser extension API depends on).
- **2020-06-08**
  - Merged slim UI into master
- **2020-06-01**
  - Fixed bug where searching would cause error (lingering previously selected object became undefined).
  - Added background search on tab load. Will display results related to tab if they exist when search bar is empty.
  - Set minimum Firefox version to 57 for access to managed storage.
  - Added static fallback for managed storage to avoid errors in Firefox when managed storage file is not present.
- **2020-05-29**
  - FEATURE: Now remembers which site was last used (attempted login).
  - Added webpack build plugin, now there are separate distributions for chrome and firefox.
- **2020-05-28**
  - New UI, started shift to container-component pattern.

### TODO
- [ ] Create custom logger so that logging can be toggled.
- [ ] Add new objects to StoredSafe.
- [ ] Unit tests of UI and hooks.
- [ ] Better comment coverage. (in progress)
- [ ] Convert options to page-component pattern.
- [ ] Check token validity of active sessions before opening popup.
- [x] ~~Change promisereducer to return function depending on previous state rather than sending state to dispatch to fix sync issues?~~
- [x] ~~Create build script (possibly webpack extension) to create separate dist folders for chrome and firefox and copy static resources to dist folders.~~
- [x] ~~Search for results related to tab in content\_script.~~
- [x] ~~Create build script (possibly webpack extension) to create separate dist folders for chrome and firefox and copy static resources to dist folders.~~

### Known bugs
- [ ] Doesn't invalidate session if one exists when a site is removed
- [x] ~~Fields occasionally change order when clicked "show" on encrypted field.~~
- [x] ~~Decrypts on copy even when object is already decrypted.~~
- [x] ~~Show flag on encrypted fields resets when clicking fill/copy or show on another object.~~
- [x] ~~Errors if writing in search bar while search is ongoing (automatic currently search disabled as temporary fix).~~

### Future ideas
- PIN code lock instead of logout after idle timer runs out.
  - Use PIN code to encrypt session-specific data (tokens, cached searches etc.)
- Idle timer warning notification.
- Encrypt plain text data in popup (transparent encryption update).
