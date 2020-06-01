# storedsafe-browser-extension

StoredSafe browser extension for Chrome and Firefox.

**NOTE: Current version is only compatible with StoredSafe 2.1.0**
**NOTE: Firefox version currently only works if the managed storage file exists.**
**NOTE: Auto search currently disabled, press enter or search button to perform search.**

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

### Project Structure
- **.storybook/** Storybook configuration for manual UI testing (setup and general styles).
- **assets/** Static public files (currently no build script to move these to dist, see [TODO](#todo).
  - **index.html** (currently in dist/) Entry point for extension UI.
  - **manifest.json** (currently in dist/) Extension manifest defining for example permissions and which scripts the extension should.
- **coverage/** Test coverage, generated by `yarn test:coverage`. *lcov-report/* folder contains html version which can be viewed in browser.
- **dist/** Compiled, unpacked extension. Currently single dist for chrome and firefox, will use build script later, see [TODO](#todo).
- **graphics/** Source graphics used for imports which are then bundled by webpack when used.
- **managed\_storage/** Example files for extension data managed by the organization, see [Install](#install) for more information.
- **node\_modules/** 3rd party libraries, generated by *yarn*/*npm*.
- **src/**
  - **__mocks__/** Helpers for mocking imports and external dependencies during tests.
  - **components/** React components, should not have any direct external dependencies but rather depend on props.
  - **custom\_typings/** Custom TypeScript definitions and fix for image imports.
  - **hooks/** Custom React hooks to manage more complex state management.
    - **createPromiseReducerState.tsx** Creates a React context and the associated state/dispatch functions for a global, asynchronous version of the useReducer hook.
    - **useStorage.tsx** *PromiseReducerState* implementation for interfacing with external data in the React portion of the extension.
  - **ico/** SVG icons, either as files or as code.
    - **index.ts** Expose SVG files, matches ico values from StoredSafe templates.
    - **svg.tsx** Expose SVG elements specific to extension (menu icons, etc).
  - **model/** Model to manage and represent external data either from browser storage or StoredSafe.
  - **pages/** React containers, should transform external data and methods into props for React components, essentially implementing the pure UI components.
  - **reducers/** Reducer functions for dispatching events to the model layer.
  - **scripts/** Background scripts to be run by the extension.
    - **background.ts** Handles browser events and manages timeouts of sessions.
    - **content\_script.ts** Runs in the background on individual pages, handles form events.
  - **stories/** Storybook pages for manual UI testing using only example data.
  - **Extension.tsx** Main React component for the extension UI.
  - **index.scss** Global styles.
  - **index.tsx** Main entrypoint for the extension UI, responsible for injecting the React code into the page.
  - **inputs.scss** Global input styles (separated from index.scss for readability).
  - **setupTests.ts** Initialization for tests using Jest, prepares Jest for testing React components using Enzyme.
  - **variables.scss** All globally applicable values for consistent styling (colors, padding, etc).
- **.eslintrc.js** ESLint JavaScript/TypeScript code style rules configuration.
- **.stylelintrc.json** StyleLint CSS code style rules configuration.
- **jest.config.js** Jest test library configuration.
- **package.json** Node package info, lists dependencies and other general information.
- **postcss.config.js** PostCSS configuration, inserts css compatibility prefixes automatically where needed.
- **tsconfig.json** TypeScript configuration
- **webpack.config.js** Webpack build configuration, compiles code and bundles dependencies.
- **yarn.lock/package-lock.json** Comprehensive dependency list for consistent dependency versions, generated by *yarn*/*npm*.

### Changelog
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
- [ ] Add new objects to StoredSafe.
- [ ] Unit tests of UI and hooks.
- [ ] Better comment coverage.
- [ ] Convert options and debug page to page-component pattern.
- [ ] Visual indicator for selected search result.
- [ ] Change promisereducer to return function depending on previous state rather than sending state to dispatch to fix sync issues?
- [ ] Check token validity of active sessions before opening popup.
- [ ] Create build script (possibly webpack extension) to create separate dist folders for chrome and firefox and copy static resources to dist folders.
- [x] ~~Search for results related to tab in content\_script.~~
- [x] ~~Create build script (possibly webpack extension) to create separate dist folders for chrome and firefox and copy static resources to dist folders.~~

### Known bugs
- [ ] Doesn't invalidate session if one exists when a site is removed
- [ ] Show flag on encrypted fields resets when clicking fill/copy or show on another object.
- [x] ~~Errors if writing in search bar while search is ongoing (automatic currently search disabled as temporary fix).~~

### Questions
- Should users be able to add their own sites or should managed sites be the only option?
  - Currently few clients and most of them will most likely only need the one (or more) provided by the organization in which case the option to add more sites might be confusing.
  - I imagine the few users that currently use sites from different organizations right now are people who can actually access and edit the managed configuration files.
  - May be more relevant at a point where StoreSafe becomes more open for example with the open source version of StoredSafe or if a personal subscription model opens up.
