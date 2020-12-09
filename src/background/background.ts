import { getMessage, LocalizedMessage } from "../global/i18n";
import { ignore, preferences, sessions, settings } from "../global/storage";
import { auth, vault } from "../global/api";
import { hardTimeout, idleInterval, keepAlive, onlineStatus } from "./tasks";
import {
  ALARM_HARD_TIMEOUT,
  ALARM_KEEP_ALIVE,
  splitAlarmName,
} from "./constants";
import type { Message } from "../global/messages";
import { saveFlow } from "./flows/saveFlow";
import { autoSearch } from "./tasks/autoSearch";
import { stripURL } from "../global/storage/preferences";
import { fillFlow } from "./flows/fillFlow";
import { Logger } from "../global/logger";

const logger = new Logger('background')
logger.debug('BACKGROUND SCRIPT INITIALIZED')

/**
 * Invalidate all sessions.
 */
function logoutAll(): void {
  sessions
    .get()
    .then((sessions) => {
      for (const [host, session] of sessions) {
        auth.logout(host, session.token).catch(console.error);
      }
    })
    .catch(console.error);
}

/**
 * Set the browser action icon to reflect the online status.
 * @param isOnline `true` if at least one active session exists.
 */
function setIcon(isOnline: boolean): void {
  const icon = isOnline ? "icon" : "icon-inactive";
  browser.browserAction.setIcon({
    path: {
      48: `assets/${icon}_48.png`,
      96: `assets/${icon}_96.png`,
    },
  });
}

/**
 * Handle changes to idle state.
 * @param state New idle state.
 */
function onIdle(state: browser.idle.IdleState): void {
  if (state === "idle") {
    console.debug("State changed to idle, invalidating all sessions.");
    logoutAll();
  }
}

/**
 * Used instead of setTimeout and setInterval for event based background page.
 * @param alarmInfo Alarm metadata.
 */
function onAlarm(alarmInfo: browser.alarms.Alarm) {
  const [name, ...parts] = splitAlarmName(alarmInfo.name);
  switch (name) {
    case ALARM_KEEP_ALIVE: {
      const [host, token] = parts;
      console.debug("Keepalive triggered for %s", host);
      auth.check(host, token).catch(console.error);
      break;
    }
    case ALARM_HARD_TIMEOUT: {
      const [host, token] = parts;
      console.debug(`Hard timeout, invalidating session for ${host}`);
      auth.logout(host, token).catch(console.error);
    }
  }
}

async function getActiveTab(): Promise<browser.tabs.Tab> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function autoFill(): Promise<void> {
  const tab = await getActiveTab();
  if (!tab) {
    console.error("Tab is undefined");
    return;
  }
  let counter = 3;
  const INTERVAL = 500;
  // Wait for results, maximum of INTERVAL * counter start value ms
  while (!currentTabResults.has(tab.id) && counter-- > 0) {
    await new Promise((res) => {
      setTimeout(() => {
        res();
      }, INTERVAL);
    });
  }
  // Could not find results
  if (!currentTabResults.has(tab.id)) return;
  if (currentTabResults.get(tab.id).length === 0) return;

  // Check if user shold be asked for preferred result first
  const currentPreferences = await preferences.get();
  const url = stripURL(tab.url);
  const fillPreferences = currentPreferences.autoFill.get(url);

  let result: StoredSafeObject;
  const tabResults = currentTabResults.get(tab.id);
  if (!!fillPreferences) {
    result = tabResults.find(
      ({ host, id: objectId }) =>
        host === fillPreferences.host && objectId === fillPreferences.objectId
    );
  }
  if (!result) {
    fillFlow(url, tab.id, tabResults);
  } else {
    fill(result);
  }
}

/**
 * Fill forms on the active tab with data from a StoredSafe object.
 * @param result The StoredSafe object to fill on the active tab.
 * @param tabId ID of tab if the tab ID is already known, avoids multiple lookups.
 */
async function fill(
  result: StoredSafeObject,
  tab?: browser.tabs.Tab
): Promise<void> {
  if (tab === undefined) tab = await getActiveTab();
  const url = stripURL(tab.url);
  await preferences.setAutoFillPreferences(url, {
    host: result.host,
    objectId: result.id,
  });
  const values: Record<string, string> = {};
  for (let i = 0; i < result.fields.length; i++) {
    let field = result.fields[i];
    // Decrypt if needed
    if (field.isEncrypted && !result.isDecrypted) {
      const currentSessions = await sessions.get();
      result = await vault.decryptObject(
        result.host,
        currentSessions.get(result.host).token,
        result
      );
      field = result.fields[i];
    }
    values[field.name] = field.value;
  }
  browser.tabs.sendMessage(tab.id, {
    context: "fill",
    action: "fill",
    data: values,
  });
}

async function startSaveFlow(
  tabId: number,
  data: Record<string, any>
): Promise<void> {
  const currentSessions = await sessions.get();
  const currentIgnore = await ignore.get();
  if (currentSessions.size < 1 || currentIgnore.includes(data.url)) return;
  saveFlow(data, tabId, currentTabResults.get(tabId));
}

/**
 * Handle incoming messages.
 * @param message Message sent from other scripts.
 */
function onMessage(
  message: Message,
  sender: browser.runtime.MessageSender
): any {
  const { context, action, data } = message;
  if (context === "save" && action === "init") {
    startSaveFlow(sender.tab?.id, data).catch(console.error);
  } else if (context === "fill" && action === "init") {
    autoFill();
  } else if (context === "fill" && action === "fill") {
    fill(message.data);
  } else if (context === "iframe") {
    // Forward message
    browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      // Return in case data needs to come back to initiating script
      return browser.tabs.sendMessage(tab.id, message);
    });
  }
}

/**
 * Wrap a message callback with a port.
 * @param port Port that sent the message.
 */
function onPortMessage(port: browser.runtime.Port): any {
  return (message: Message) => onMessage(message, port.sender);
}

function onSearchConnect(port: browser.runtime.Port): void {
  browser.tabs
    .query({ active: true, currentWindow: true })
    .then(([tab]) => {
      port.postMessage({
        context: "autosearch",
        action: "populate",
        data: currentTabResults.get(tab.id) ?? [],
      });
    })
    .catch(console.error);
}

function onContentConnect(port: browser.runtime.Port): void {
  settings.get().then((currentSettings) => {
    if (currentSettings.get("autoFill")?.value === true) {
      autoFill();
    }
  });
}

function onConnect(port: browser.runtime.Port) {
  if (port.name === "search") onSearchConnect(port);
  if (port.name === "content") onContentConnect(port);

  const messageCallback = onPortMessage(port);
  port.onMessage.addListener(messageCallback);

  function onDisconnect() {
    port.onMessage.removeListener(messageCallback);
    port.onDisconnect.removeListener(onDisconnect);
  }
  port.onMessage.addListener(messageCallback);
  port.onDisconnect.addListener(onDisconnect);
}

let currentTabResults: Map<number, StoredSafeObject[]> = new Map();
function onTabResultsChanged(tabResults: Map<number, StoredSafeObject[]>) {
  currentTabResults = tabResults;
  for (const [tabId, results] of tabResults) {
    if (results.length > 0) {
      browser.browserAction.setBadgeText({
        tabId,
        text: results.length.toString(),
      });
    }
  }
}

function onCommand(command: string): void {
  if (command === "fill") autoFill();
}

// Set up tasks that depend on timers and changes in storage.
const untrackIdleInterval = idleInterval();
const untrackKeepAlive = keepAlive();
const untrackOnlineStatus = onlineStatus(setIcon);
const untrackHardTimeout = hardTimeout();
const untrackAutoSearch = autoSearch(onTabResultsChanged);

browser.idle.onStateChanged.addListener(onIdle);
browser.alarms.onAlarm.addListener(onAlarm);
browser.runtime.onMessage.addListener(onMessage);
browser.runtime.onConnect.addListener(onConnect);
browser.commands.onCommand.addListener(onCommand);
