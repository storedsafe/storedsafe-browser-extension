const MessageType = Object.freeze({
  LOGIN: 'login',
  LOGOUT: 'logout',
  GET_SETTINGS: 'getSettings',
  GET_TOKEN: 'getToken',
});

function sendMessage(messageType, data) {
  return browser.runtime.sendMessage({ messageType, data });
}

export { MessageType };
export default Object.freeze({
  login: (data) => (sendMessage(MessageType.LOGIN, data)),
  logout: (data) => (sendMessage(MessageType.LOGOUT, data)),
  getSettings: (data) => (sendMessage(MessageType.GET_SETTINGS, data)),
  updateSettings: (data) => (sendMessage(MessageType.UPDATE_SETTINGS, data)),
  getToken: (data) => (sendMessage(MessageType.GET_TOKEN, data)),
});
