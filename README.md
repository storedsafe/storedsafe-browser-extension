# storedsafe-browser-extension

StoredSafe browser extension for Chrome and Firefox.

## Setup

### Install

1. To build the project, fetch the latest version with git and then run `yarn build` or `npm run build`. This will create unpackaged builds for chrome and firefox in the `build/dist` folder.
2. Follow instructions for the browser of your choice below:
  - To install in chrome, go to [chrome://extensions](chrome://extensions) and click *Load Unpackaged*. Navigate to the `dist/chrome` folder and click *open*.
  - To install in firefox, go to [about:debugging](about:debugging) and click *This Firefox* followed by *Load Temporary Add-on...*. Navigate to the `dist/firefox` folder and click *open*.

### Build
Requires npm or yarn to build. Currently depends on storedsafe-javascript package from this git server which requires an ssh-key to fetch. Future versions will fetch this from a public repository.

```bash
yarn
yarn build  # Production build
yarn zip    # Produce zipped folders of build in dist/ for distribution
yarn dev    # Development build
yarn watch  # Continous development build
```

or

```bash
npm install
npm run build
# ... same as yarn but prefixed with run
```

Check package.json for all scripts or use `yarn <command>` to use the installed tools directly.

### Managed Storage

It's possible to configure the extension through policies if you as an organization want to configure the extension for your employees. There are some example configurations in the `examples/managed_storage/` folder. How policies are configured depends on the operating system of the client computer and how your organization pushes out policies to its employees. More information can be found in the links below.

- [Firefox Managed Policy](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests#Managed_storage_manifests).
- [Chromium Managed Policy](https://www.chromium.org/administrators/policy-templates).
