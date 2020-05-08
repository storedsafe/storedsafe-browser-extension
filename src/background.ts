import StoredSafe from 'storedsafe';
import * as Sessions from './model/Sessions';
import * as Settings from './model/Settings';

/**
 * Session management functions and initialization
 * */
let sessionTimers: {
  [url: string]: number;
} = {};
let idleTimer: number;

const invalidateSession = (url: string): void => {
  console.log('Invalidating session: ', url);
  Sessions.actions.fetch().then((sessions) => {
    const { apikey, token } = sessions[url];
    const storedSafe = new StoredSafe(url, apikey, token);
    storedSafe.logout();
    Sessions.actions.remove(url);
  });
};

const invalidateAllSessions = (): void => {
  console.log('Invalidating all sessions');
  Sessions.actions.fetch().then((sessions) => {
    Object.keys(sessions).forEach((url) => {
      const { apikey, token } = sessions[url];
      const storedSafe = new StoredSafe(url, apikey, token);
      storedSafe.logout();
    });
    Sessions.actions.clear();
  });
};

/**
 * Event handler functions
 * */
function onStorageChange(
  { sessions }: { sessions: browser.storage.StorageChange },
  area: 'local' | 'sync' | 'managed',
): void {
  if (area === 'local' && sessions !== undefined && sessions.newValue !== undefined) {
    Settings.actions.fetch().then((settings) => {
      const newSessions = sessions.newValue;
      Object.keys(sessionTimers).forEach((url) => {
        clearTimeout(sessionTimers[url]);
      });
      sessionTimers = {};
      Object.keys(newSessions).forEach((url) => {
        const tokenLife = Date.now() - newSessions[url].createdAt;
        const tokenTimeout = (settings.maxTokenLife.value as number * 60 * 1000) - tokenLife;
        sessionTimers[url] = window.setTimeout(() => invalidateSession(url), tokenTimeout);
      });
    });
  }
}

function onInstalled(
  { reason }: { reason: browser.runtime.OnInstalledReason }
): void {
  browser.contextMenus.create({
    id: 'open-popup',
    title: 'Show StoredSafe',
    contexts: ['editable'],
  });

  if (reason === 'install' || reason === 'update') {
    browser.runtime.openOptionsPage();
  }
}

function onIdle(
  state: browser.idle.IdleState
): void {
  Settings.actions.fetch().then((settings) => {
    if (state === 'locked') {
      console.log('Device is locked, invalidate all sessions.');
      invalidateAllSessions();
    } else if (state === 'idle') {
      if (idleTimer) {
        window.clearTimeout(idleTimer);
      }
      const idleTimeout = settings.idleMax.value as number * 1000 * 60;
      idleTimer = window.setTimeout(() => {
        console.log('Idle timer expired, invalidate all sessions.');
        invalidateAllSessions()
      }, idleTimeout);
    }
  });
}

function onSuspend(): void {
  console.log('Suspended, invalidate all sessions.');
  invalidateAllSessions();
}

function onMenuClick(
  info: browser.contextMenus.OnClickData,
  tab: browser.tabs.Tab,
): void {
  switch (info.menuItemId) {
    case 'open-popup': {
      browser.browserAction.openPopup().then().catch().then(() => {
        browser.runtime.sendMessage({
          type: 'popup-search',
          data: { url: tab.url },
        });
      });
      break;
    }
    default: {
      break;
    }
  }
}

/**
 * Subscribe to events and initialization
 * */

// TODO: Remove debug pritnout
console.log('Background script initialized: ', new Date(Date.now()));

// Invalidate all sessions on launch
invalidateAllSessions();

// Listen to changes in storage to know when sessions are updated
browser.storage.onChanged.addListener(onStorageChange);

// Open options page and set up context menus
browser.runtime.onInstalled.addListener(onInstalled);

// Invalidate sessions on suspend
browser.runtime.onSuspend.addListener(onSuspend);

// Invalidate sessions after being idle for some time
browser.idle.onStateChanged.addListener(onIdle);

browser.contextMenus.onClicked.addListener(onMenuClick);
