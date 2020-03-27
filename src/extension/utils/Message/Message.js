const MessageType = Object.freeze({
  LOGIN: 'login',
  LOGOUT: 'logout',
});

export { MessageType };
export default Object.freeze({
  login: (message) => (
    browser.runtime.sendMessage({
      messageType: MessageType.LOGIN,
      ...message,
    })
  ),

  logout: () => (
    browser.runtime.sendMessage({
      messageType: MessageType.LOGOUT,
    })
  ),
});
