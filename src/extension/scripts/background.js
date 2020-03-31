import StoredSafe from 'storedsafe';
import { LoginType } from '../components/Auth';
import { MessageType } from '../lib/Message';

let storedSafe;

require('./expose_helpers');

// /// EVENT HANDLERS /////
function onInstalled() {
  browser.contextMenus.create({
    id: 'open-popup',
    title: 'open popup',
    contexts: ['editable'],
  });
  browser.runtime.openOptionsPage();
}

function getSettings() {
  return browser.storage.local.get();
}

function updateSettings(data) {
  return browser.storage.local.set(data);
}

function login({ loginType, remember, fields }) {
  return getSettings().then(({ site, apikey }) => {
    if (remember) {
      updateSettings({ username: fields.username });
    }
    storedSafe = new StoredSafe(site, apikey);
    if (loginType === LoginType.YUBIKEY) {
      const { username, passphrase, otp } = fields;
      return storedSafe.authYubikey(username, passphrase, otp);
    }
    if (loginType === LoginType.YUBIKEY) {
      const { username, passphrase, otp } = fields;
      return storedsafe.authTotp(username, passphrase, otp);
    }
    return Promise.reject(new Error(`Unknown login type ${loginType}.`));
  });
}

function logout() {
  return storedSafe.logout();
}

function getToken() {
  if (storedSafe !== undefined) {
    return Promise.resolve({ token: storedSafe.token || null });
  }
  return Promise.resolve({ token: null });
}

function handleMessage(request, sender) {
  switch (request.messageType) {
    case MessageType.LOGIN:
      return login(request.data);
    case MessageType.LOGOUT:
      return logout(request.data);
    case MessageType.GET_SETTINGS:
      return getSettings(request.data);
    case MessageType.UPDATE_SETTINGS:
      return updateSettings(request.data);
    case MessageType.GET_TOKEN:
      return getToken(request.data);
    default:
      return Promise.reject(new Error('Invalid message', request, sender));
  }
}

// /// SUBSCRIBE TO EVENTS /////
browser.runtime.onInstalled.addListener(onInstalled);
browser.runtime.onMessage.addListener(handleMessage);

browser.contextMenus.onClicked.addListener((info) => {
  switch (info.menuItemId) {
    case 'open-popup':
      browser.browserAction.openPopup();
      break;
    default:
      break;
  }
});
