import StoredSafe from 'storedsafe';
import { actions } from '../model/StoredSafe';
import * as Sessions from '../model/Sessions';
import * as Settings from '../model/Settings';
import * as Search from '../model/Search';

//
// Session management functions and initialization
//

// Timers for invalidating sessions.
let sessionTimers: {
  [url: string]: number;
} = {};
let idleTimer: number;

/**
 * Invalidate a single session.
 * */
function invalidateSession(url: string): void {
  console.log('Invalidating session: ', url);
  actions.logout(url);
}

/**
 * Invalidate all sessions and clear search results.
 * Doesn't use storedsafe actions to avoid unnecessary calls to storage areas.
 * */
function invalidateAllSessions(): void {
  console.log('Invalidating all sessions');
  Sessions.actions.fetch().then((sessions) => {
    Object.keys(sessions).forEach((url) => {
      const { apikey, token } = sessions[url];
      const storedSafe = new StoredSafe(url, apikey, token);
      storedSafe.logout();
    });
    Sessions.actions.clear();
    Search.actions.clear();
  });
}

/**
 * Find search results related to loaded tab.
 * */
function tabFind(tab: browser.tabs.Tab): Promise<void> {
  const { id, url } = tab;
  const match = url.match(/^(?:https?:\/\/)?(?:www)?([^/]*)\//i);
  const needle = match !== null ? match[1] : url;
  return actions.tabFind(id, needle).then((search) => {
    Settings.actions.fetch().then((settings) => {
      // if (settings.autoFill) { // TODO: Fix repeated attempts when auto submitting invalid form
        // console.log('SEARCH', search, id);
        // const results = search[id];
        // console.log('RESULTS', results);
        // const resultUrls = Object.keys(results);
        // let selectedResult: Search.SearchResult;
        // for (let i = 0; i < resultUrls.length; i++) {
          // const url = resultUrls[i];
          // const ids = Object.keys(results[url]);
          // console.log(results, url, ids);
          // if (ids.length > 0) {
            // selectedResult = results[url][ids[0]];
          // }
        // }
        // if (selectedResult) {
          // const fields = selectedResult.fields;
          // const data: { [field: string]: string } = {};
          // Object.keys(fields).forEach((field) => {
            // data[field] = fields[field].value;
          // });
          // browser.tabs.sendMessage(id, {
            // type: 'fill',
            // data: data,
          // });
        // }
      // }
    });
  });
}

function copyToClipboard(value: string): Promise<void> {
  console.log('Copy to clipboard.');
  return navigator.clipboard.writeText(value).then(() => {
    setTimeout(() => {
      navigator.clipboard.writeText('');
      console.log('Cleared clipboard.');
    }, 10000);
  });
}

/**
 * Event handler functions
 * */
function onStartup(): void {
  invalidateAllSessions();
}

function onStorageChange(
  { sessions }: { sessions: browser.storage.StorageChange },
  area: 'local' | 'sync' | 'managed',
): void {
  if (area === 'local' && sessions !== undefined && sessions.newValue !== undefined) {
    Settings.actions.fetch().then((settings) => {
      const newSessions = sessions.newValue;
      if (Object.keys(newSessions).length > 0) {
        console.log('online');
        browser.browserAction.setIcon({path: "ico/icon.png"});
      } else {
        console.log('offline');
        browser.browserAction.setIcon({path: "ico/icon-inactive.png"});
      }
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
      if (idleTimer) {
        window.clearTimeout(idleTimer);
      }
    } else if (state === 'idle') {
      console.log('Idle timer started.');
      if (idleTimer) {
        window.clearTimeout(idleTimer);
      }
      const idleTimeout = settings.idleMax.value as number * 1000 * 60;
      idleTimer = window.setTimeout(() => {
        console.log('Idle timer expired, invalidate all sessions.');
        invalidateAllSessions()
      }, idleTimeout);
    } else {
      if (idleTimer) {
        console.log('Idle timer cancelled.');
        window.clearTimeout(idleTimer);
      }
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

function onMessage(
  message: { type: string; value?: string },
  sender: browser.runtime.MessageSender
): Promise<void> {
  if (message.type === 'tabSearch') {
    return tabFind(sender.tab);
  } else if (message.type === 'copy') {
    return copyToClipboard(message.value);
  }
  return Promise.reject(`Unknown message type: ${message.type}.`);
}

/**
 * Subscribe to events and initialization
 * */

// TODO: Remove debug pritnout
console.log('Background script initialized: ', new Date(Date.now()));

// Listen to changes in storage to know when sessions are updated
browser.storage.onChanged.addListener(onStorageChange);

// Invalidate all sessions on launch
browser.runtime.onStartup.addListener(onStartup);

// Open options page and set up context menus
browser.runtime.onInstalled.addListener(onInstalled);

// Invalidate sessions on suspend
if (browser.runtime.onSuspend) { // Not implemented in firefox
  browser.runtime.onSuspend.addListener(onSuspend);
}

// Invalidate sessions after being idle for some time
browser.idle.onStateChanged.addListener(onIdle);

// React to contect menu click (menu set up during onInstall)
browser.contextMenus.onClicked.addListener(onMenuClick);

// React to messages from other parts of the extension
browser.runtime.onMessage.addListener(onMessage);
