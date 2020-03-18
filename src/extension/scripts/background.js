require('./expose_helpers');

storedsafe.storage.getAllSessions().then((sessions) => {
  const sites = Object.keys(sessions.sessions);
  if (sites.length > 0) {
    sites.forEach((site) => {
      sessions.sessions[site].handler.logout();
    });
  }
});

// /// EVENT HANDLERS /////
function openWelcomeScreen() {
  browser.runtime.openOptionsPage();
}

function handleMessage(request, sender) {
  if (sender.tab.active) {
    browser.browserAction.openPopup()
      .then(() => {
        browser.runtime.sendMessage({ fields: request.fields });
      });
  }
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
