import { LoginType } from '../components/Auth';
import { MessageType } from '../utils/Message';

require('./expose_helpers');

// /// EVENT HANDLERS /////
function openWelcomeScreen() {
  browser.runtime.openOptionsPage();
}

function login({ loginType }) { // , remember, fields }) {
  if (loginType === LoginType.YUBIKEY) {
    return Promise.resolve();
  }
  if (loginType === LoginType.YUBIKEY) {
    return Promise.resolve();
  }
  return Promise.reject();
}

function logout() {
  return Promise.resolve();
}

function handleMessage(request, sender) {
  if (request.messageType === MessageType.LOGIN) return login(request);
  if (request.messageType === MessageType.LOGOUT) return logout(request);
  return Promise.reject(new Error('Invalid message', request, sender));
}

// /// SUBSCRIBE TO EVENTS /////
browser.runtime.onInstalled.addListener(openWelcomeScreen);
browser.runtime.onMessage.addListener(handleMessage);

browser.contextMenus.create({
  id: 'open-popup',
  title: 'open popup',
  contexts: ['editable'],
});

browser.contextMenus.onClicked.addListener(() => {
  browser.browserAction.openPopup();
});
