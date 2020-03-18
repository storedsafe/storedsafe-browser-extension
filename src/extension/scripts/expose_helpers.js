import StoredSafe from 'storedsafe';

const storage = require('../utils/storage');

window.storedsafe = {
  storage,
  api: StoredSafe,
  default: () => {
    browser.browserAction.setIcon({ path: 'icon.png' });
    browser.browserAction.setBadgeBackgroundColor({ color: 'blue' });
  },
  alert: () => {
    browser.browserAction.setIcon({ path: 'icon-alert.png' });
    browser.browserAction.setBadgeBackgroundColor({ color: 'red' });
  },
  inactive: () => {
    browser.browserAction.setIcon({ path: 'icon-inactive.png' });
    browser.browserAction.setBadgeBackgroundColor({ color: 'gray' });
  },
  setBadge: (text) => {
    browser.browserAction.setBadgeText({ text });
  },
};
