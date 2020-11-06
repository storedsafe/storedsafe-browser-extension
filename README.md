# StoredSafe Browser Extension

StoredSafe browser integration for Chromium (chrome and edge chromium) and Firefox.

---

## Requirements

Building the project requires *npm* to be installed on your system.
Before building, you also need to install dependencies from `/package.json`:
```bash
npm install
```

## Build

### Production
To build the project for production, run:
```bash
npm run build
```
This generates the `/dist` folder with two subfolders:
- `/dist/build` contains the unpackages builds which can be loaded directly into the browser for testing.
- `/dist/zip` contains zipped versions of the build folders which can be uploaded to the browser stores.

### Development
There are two ways to start a development build.
The first way works like the production build but uses development settings (no minification etc.).
The second way produces a continuous development build which will update as changes are detected in the code.
```bash
npm run dev   # Regular development build
npm run watch # Continuous development build
```

---

## Configuration
The extension can be configured directly in the browser extension popup by the user, or externally by an administrator.

Managed configuration is done differently depending on the user's operating system. In the `/examples` folder you can find some example configurations for different operating systems. For more information, read the instructions provided by your browser of choice:
- **chrome**: https://dev.chromium.org/administrators/configuring-policy-for-extensions
  - **Windows**: `/examples/chrome.reg`
  - **Mac**: `/examples/com.google.Chrome.plist`
  - **Linux**: `/examples/policy.json`
- **firefox**: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests
  - **All**: `/examples/storedsafe@storedsafe.com.json` 
    - location is set differently per operating system
- **edge chromium**: https://docs.microsoft.com/en-us/deployedge/microsoft-edge-policies
  - **Windows**: `/examples/edge_chromium.reg`
    - Uses same keys as chrome, simply swapping Google/Chrome for Microsoft/Edge