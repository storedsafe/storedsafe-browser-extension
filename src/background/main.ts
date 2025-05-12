/**
 * Background script for StoredSafe browser extension.
 *
 * Takes case of the following:
 *  - [x] Perform searches in StoredSafe on new tabs
 *  - [x] Keep storedsafe token alive while the browser is active
 *  - [x] Log out when the browser turns idle
 *  - [x] Log out after the token reaches its maximum lifespan
 *    - This behaviour is unique to the browser extension because the workflow
 *      is slightly different from how the server timeout for the token is.
 *    - This serves as a way to counter the risks of the keepalive feature in the
 *      browser extension.
 *  - [x] Pass information between popup/iframe and content script
 *    - [x] on connection:
 *            - [x] content script connects to background script
 *            - [x] background script checks if user is logged in (if not, do nothing)
 *            - [x] background script tells content script to scan for forms
 *            - [x] content script returns found forms to background script (if no forms, do nothing)
 *            - [x] background script checks for relevant results in StoredSafe (if none, do nothing)
 *            - [x] results are stored in session storage (for fill and popup)
 *            - [x] background script checks if autofill is enabled (if not, do nothing)
 *            - [x] start fill
 *     - [x] fill (hotkey/auto)
 *            AUTO
 *            - see on connection
 *            HOTKEY
 *            - [x] background script detects hotkey pressed
 *            - [x] background script checks if results exist for current tab (if not, do nothing)
 *            BOTH
 *            - [x] if multiple results exist, check preferences
 *            - [x] if no preferences are found, tell content script to open iframe for selection
 *            SELECTION
 *            - [x] content script receives message to open iframe
 *            - [x] content script opens iframe for fill preferences
 *            - [x] background script receives connection from iframe
 *            - [x] background script sends suggested results to iframe
 *            - [x] iframe displays results and waits for user selection
 *            - [x] iframe sends selection to background script
 *            - [x] background script saves item to preferences for current site
 *            - [x] background script tells content script to fill form
 *     - [x] fill (from popup)
 *            - [x] popup tells background script to fill with chosen storedsafe object
 *            - [x] background script saves item to preferences for current site
 *            - [x] background script tells content script to fill with chosen storedsafe object
 *            - [x] content script scans for forms to fill, fills if found
 *     - [x] save
 *            - [x] content script sets up listeners for submit events
 *            - [x] user submits form
 *            - [x] content script sends message to background script with login info
 *            - [x] background script checks for active sessions and save/ignore preferences (if no save, do nothing)
 *            REPEAT UNTIL TIMEOUT/COMPLETE (accounting for page redirects)
 *            - [x] background script tells content script to open iframe
 *            - [x] content script opens iframe for saving object
 *            - [x] background script receives connection from iframe
 *            - [x] background script sends save data to iframe
 *            - [x] iframe displays results and waits for user selection
 *            - [x] iframe saves object in storedsafe
 *            - [x] iframe notifies background it's done to cancel retries
 *  - [x] Set badge icon when user goes online/offline
 *  - [x] Set badge label when search results are found
 */
import { auth, vault } from "@/global/api";
import { getLogger } from "@/global/logger";
import {
  ignore,
  preferences,
  sessions,
  settings,
  tabresults,
} from "@/global/storage";
import {
  ALARM_HARD_TIMEOUT,
  ALARM_KEEP_ALIVE,
  genAlarmName,
  splitAlarmName,
} from "./constants";
import {
  Context,
  messageListener,
  sendTabMessage,
  type Message,
} from "@/global/messages";
import { autoSearch } from "./tasks/autoSearch";
import { stripURL } from "@/global/storage/preferences";
import { StoredSafeExtensionError } from "@/global/errors";
import { getTabResults } from "@/global/storage/tabresults";
import { SettingsFields } from "@/global/storage/settings";

// Stop presenting save popup after this many seconds
const MAX_SAVE_SESSION_DURATION = 15;

const getBackgroundLogger = async () => getLogger("background");
const tabResultsPromises: Map<number, Promise<StoredSafeObject[]>> = new Map();
const saveSessions: Map<
  number,
  { startTime: number; data: Record<string, string> }
> = new Map();
let pendingFill: { url: string; result: StoredSafeObject } | null = null;

type MessageHandler = (
  message: Message,
  sender: browser.runtime.MessageSender
) => void;

const MESSAGE_HANDLERS: {
  [from: string]: {
    [action: string]: MessageHandler;
  };
} = {
  [Context.CONTENT_SCRIPT]: {
    connect: onContentScriptConnect,
    forms: onContentScriptForms,
    submit: onContentScriptSubmit,
  },
  [Context.POPUP]: {
    "tabresults.get": onGetTabResults,
    fill: onFill,
    "fill.pending": onPendingFill,
  },
  [Context.FILL]: {
    "tabresults.get": onGetTabResults,
    fill: onFill,
  },
  [Context.SAVE]: {
    "submitdata.get": onGetSubmitData,
    "submitdata.delete": onDeleteSubmitData,
  },
};

////////////////////////////// ON STARTUP //////////////////////////////

getBackgroundLogger().then((logger) => {
  logger.info("Background script loaded.");
});

// These functions will only apply the newValues field,
// and the 2nd parameter will default to the empty version.
// This way everything will be detected as a change.
getSettings()
  .then(onSettingsChanged)
  .catch(async (e) =>
    (await getBackgroundLogger()).error("Get settings error: %o", e)
  );
getSessions()
  .then(onSessionsChanged)
  .catch(async (e) =>
    (await getBackgroundLogger()).error("Get sessions error: %o", e)
  );

////////////////////////////// EVENT HANDLERS //////////////////////////////

browser.tabs.onActivated.addListener(
  async (activeInfo: browser.tabs._OnActivatedActiveInfo) => {
    setTabResultsCount(activeInfo.tabId);
  }
);

/**
 * Listen for incoming messages from content script and popup.
 */
browser.runtime.onMessage.addListener(
  messageListener(async (message, sender) => {
    const logger = await getBackgroundLogger();
    if (message.to === Context.CONTENT_SCRIPT) {
      logger.debug("Forwarding message to content script: %o", message);
      return await sendTabMessage(message);
    }
    if (message.to !== Context.BACKGROUND) return;
    logger.debug("Incoming message: %o", message);
    const messageHandler = MESSAGE_HANDLERS[message.from]?.[message.action];
    if (messageHandler) return messageHandler(message, sender);
  })
);

/**
 * Log out users when browser becomes idle.
 */
browser.idle.onStateChanged.addListener(
  async (state: browser.idle.IdleState) => {
    const logger = await getBackgroundLogger();
    if (state === "idle") {
      logger.info("State changed to idle, invalidating all sessions.");
      logoutAll();
    }
  }
);

/**
 * Listen for changes to extension settings.
 *  - idleMax: Update the idle detection interval for automatic logout.
 *  - maxTokenLife: Update the alarms for hard capping the session lifetime.
 */
browser.storage.onChanged.addListener(
  settings.onSettingsChanged(onSettingsChanged)
);

/**
 * Listen for changes to extension sessions.
 * Update alarms for invalidating sessions.
 */
browser.storage.onChanged.addListener(
  sessions.onSessionsChanged(onSessionsChanged)
);

/**
 * Listen for timed events such as automatic logout or keepalive.
 */
browser.alarms.onAlarm.addListener(onAlarmTriggered);

/**
 * Listen for user keyboard shortcuts.
 */
browser.commands.onCommand.addListener(async (command) => {
  if (command === "fill") {
    const activeTab = await getActiveTab();
    quickFill(activeTab, activeTab?.url);
  }
});

////////////////////////////// MESSAGE HANDLERS //////////////////////////////

/**
 * If the user is online and scanning is turned on (not yet implemented),
 * tell the content script to scan for forms.
 */
async function onContentScriptConnect(
  _message: Message,
  sender: browser.runtime.MessageSender
) {
  const logger = await getBackgroundLogger();
  if (!sender?.url) return;
  if (!sender?.tab?.id) return;
  if (!(await isOnline())) return;

  // Perform auto search
  await updateTabResults(sender.tab, sender.url);

  // Check if a submit event is currently going on and the page reloaded
  const saveSession = saveSessions.get(sender.tab.id);
  if (saveSession) {
    // If the submit event started too long ago, stop trying
    if (+new Date() - saveSession.startTime < MAX_SAVE_SESSION_DURATION * 1e3) {
      saveSessions.delete(sender.tab.id);
    }

    // Tell content script to open an iframe for saving a login
    else {
      sendTabMessage({
        from: Context.BACKGROUND,
        to: Context.CONTENT_SCRIPT,
        action: "iframe.create",
        data: { id: "save" },
      });
    }
  }

  // Tell the content script to scan for forms
  return {
    from: Context.BACKGROUND,
    to: Context.CONTENT_SCRIPT,
    action: "scan",
  };
}

/**
 * If the content script finds any forms after scanning, perform a search
 * in StoredSafe for potentially related objects.
 *
 * These results will be put into the extension session storage where they can
 * be fetched by the popup to pre-populate the search window.
 */
async function onContentScriptForms(
  message: Message,
  sender: browser.runtime.MessageSender
) {
  if (!message.data) return;
  if (!sender?.url) return;
  if (!sender?.tab?.id) return;
  if (!(await isOnline())) return;
  const logger = await getBackgroundLogger();
  const tabID = sender.tab.id;
  const tabURL = sender.url;

  // Only auto fill the first time forms are found
  // Some sites change constantly, which would keep updating the forms list
  if (message.data.isOriginalForms) {
    const currentSettings = await settings.get();

    // If the user clicked the login button from a result in the popup, automatically fill the page
    if (pendingFill && stripURL(tabURL) === stripURL(pendingFill.url)) {
      logger.debug("Performing pending fill on %s", tabURL);
      fill(sender.tab, sender.url, pendingFill.result);
    }

    // If auto fill is enabled, fill forms immediately
    else if (currentSettings.get(SettingsFields.AUTO_FILL)?.value) {
      // If search results are currently pending, wait for search to complete
      if (tabResultsPromises.get(tabID)) {
        await tabResultsPromises.get(tabID);
      }
      logger.debug("Auto fill on %s", tabURL);
      quickFill(sender.tab, sender.url);
    }

    // Clear pending fill once the site has loaded
    pendingFill = null;
  }
}

/**
 * If the content script detects a submit event, see if the user should be
 * prompted to save the
 */
async function onContentScriptSubmit(
  message: Message,
  sender: browser.runtime.MessageSender
) {
  if (!message.data) return;
  if (!sender?.url || !sender?.tab?.id) return;
  if (!(await isOnline())) return;
  // If the user settings are set to not save logins, exit
  const currentSettings = await settings.get();
  if (!currentSettings.get(SettingsFields.OFFER_SAVE)) return;
  // If the user settings are set to ignore this url, exit
  const ignoreList = await ignore.get();
  if (ignoreList.includes(sender.url)) return;
  // If the submitted login already exists, exit
  const tabResults = await updateTabResults(sender.tab, sender.url);
  if (matchingObjectExists(tabResults, message.data.url, message.data.username))
    return;

  // Open iframe to offer to save the login
  sendTabMessage({
    from: Context.BACKGROUND,
    to: Context.CONTENT_SCRIPT,
    action: "iframe.create",
    data: { id: "save" },
  });

  // Register the submit event to still show the submit popup
  // if the page reloads (may happen multiple times).
  saveSessions.set(sender.tab.id, {
    startTime: +new Date(),
    data: message.data,
  });
}

/**
 * Get cached search results related to the current tab from session storage.
 */
async function onGetTabResults(): Promise<StoredSafeObject[]> {
  if (!(await isOnline())) return [];
  const tabId = (await getActiveTab())?.id;
  if (!tabId) return [];
  return await tabresults.getTabResults(tabId);
}

async function onGetSubmitData(): Promise<Record<string, string>> {
  if (!(await isOnline())) return {};
  const tabId = (await getActiveTab())?.id;
  if (!tabId) return {};
  return saveSessions.get(tabId)?.data ?? {};
}

async function onDeleteSubmitData() {
  const tabId = (await getActiveTab())?.id;
  if (tabId) saveSessions.delete(tabId);
}

/**
 * Send the selected result to the content script to fill any available forms.
 */
async function onFill(message: Message) {
  const logger = await getBackgroundLogger();
  if (!(await isOnline())) return;
  if (!message.data) {
    logger.warn("Requested fill without any data.");
    return;
  }
  const activeTab = await getActiveTab();
  fill(activeTab, activeTab?.url, message.data);
}

/**
 * Set the selected result to fill once the page loads
 */
async function onPendingFill(message: Message) {
  const logger = await getBackgroundLogger();
  if (!(await isOnline())) return;
  if (!message.data) {
    logger.warn("Requested fill without any data.");
    return;
  }
  logger.debug("Pending fill: %o", message.data);
  pendingFill = message.data;
}

////////////////////////////// STORAGE HANDLERS //////////////////////////////

/**
 * Delegate tasks for handling with updated settings.
 */
async function onSettingsChanged(
  newSettings: Map<string, Setting>,
  oldSettings: Map<string, Setting> = new Map()
) {
  for (const [key, setting] of newSettings) {
    if (setting.value === oldSettings.get(key)?.value) continue;
    if (key === SettingsFields.IDLE_MAX) {
      onIdleMaxChanged(setting.value as number | undefined);
    } else if (key === SettingsFields.MAX_TOKEN_LIFE) {
      onMaxTokenLifeChanged(setting.value as number);
    }
  }
}

/**
 * Perform tasks for new and deleted sessions:
 *   - Handle alarms for session timeouts
 *   - Perform autosearch on login
 *   - Clean up tabresults on logout
 */
async function onSessionsChanged(
  newSessions: Map<string, Session>,
  oldSessions: Map<string, Session> = new Map()
) {
  const logger = await getBackgroundLogger();
  const setting = (await getSettings()).get(SettingsFields.MAX_TOKEN_LIFE);
  let maxTokenLifeHours = 0;
  if (setting) maxTokenLifeHours = setting.value as number;

  let isOnline = false;
  let wasOnline = false;

  // Set up alarms for new sessions
  for (const [host, session] of newSessions) {
    isOnline = true; // at least one session exists
    if (!oldSessions.has(host)) {
      logger.info(`New session found for ${host}, updating session alarms...`);
      const activeTab = await getActiveTab();
      if (activeTab) await updateTabResults(activeTab, activeTab.url);
      setHardtimeoutAlarm(maxTokenLifeHours, host, session);
      setKeepAliveAlarm(host, session);
    }
  }

  // Clear alarms for removed sessions
  for (const [host, session] of oldSessions) {
    wasOnline = true; // at least one session existed
    const hostAlarmName = genAlarmName(ALARM_HARD_TIMEOUT, host, session.token);
    if (!newSessions.has(host)) {
      logger.info(`Session removed for ${host}, cleaning up...`);
      await tabresults.removeHostResults(host);
      clearHardTimeoutAlarm(host, session);
      clearKeepAliveAlarm(host, session);
    }
  }

  if (isOnline != wasOnline) {
    // Update online status on badge
    setIcon(isOnline);

    if (isOnline) {
      // Instruct content script to scan for forms
      sendTabMessage({
        from: Context.BACKGROUND,
        to: Context.CONTENT_SCRIPT,
        action: "scan",
      });
    }

    logger.info(`Online status changed to ${isOnline}`);
  }
}

////////////////////////////// HELPER FUNCTIONS //////////////////////////////

/**
 * @returns true if there are any active sessions.
 */
async function isOnline(): Promise<number> {
  const currentSessions = await sessions.get();
  return currentSessions.size;
}

/**
 * Set up alarms for invalidating sessions after the hard lifetime limit.
 * If maxTokenLife is 0, clear all session alarms.
 * @param maxTokenLifeHours The max amount of hours a token is allowed to be active.
 */
async function onMaxTokenLifeChanged(maxTokenLifeHours: number): Promise<void> {
  const logger = await getBackgroundLogger();
  const currentSessions = await getSessions();

  logger.debug("maxTokenLife changed, updating session alarms...");
  for (let [host, session] of currentSessions) {
    setHardtimeoutAlarm(maxTokenLifeHours, host, session);
  }
}

/**
 * Handle time-based events such as keepalive and invalidating sessions.
 * @param alarm The triggered alarm.
 */
async function onAlarmTriggered(alarm: browser.alarms.Alarm): Promise<void> {
  const logger = await getBackgroundLogger();
  logger.debug(`Alarm triggered: ${alarm.name}`);
  const [name, ...parts] = splitAlarmName(alarm.name);
  switch (name) {
    case ALARM_KEEP_ALIVE:
      {
        const [host, token] = parts;
        const currentSessions = await sessions.get();
        if (!(host in currentSessions)) {
          // Clean up lingering alarms from unintended states
          browser.alarms.clear(alarm.name);
          logger.debug("Cleaning up lingering keepalive alarm.");
        } else {
          logger.info("Keepalive triggered for %s", host);
          auth.check(host, token).catch(console.warn);
        }
      }
      break;
    case ALARM_HARD_TIMEOUT:
      {
        const [host, token] = parts;
        const currentSessions = await sessions.get();
        if (!(host in currentSessions)) {
          // Clean up lingering alarms from unintended states
          browser.alarms.clear(alarm.name);
          logger.debug("Cleaning up lingering hard timeout alarm.");
        } else {
          logger.info(`Hard timeout, invalidating session for ${host}`);
          auth.logout(host, token).catch(logger.warn);
        }
      }
      break;
  }
}

/**
 * Helper function to get sessions and handle errors.
 * @returns Currently active sessions.
 */
async function getSessions(): Promise<Map<string, Session>> {
  const logger = await getBackgroundLogger();
  try {
    return await sessions.get();
  } catch (e) {
    logger.error("Failed to get sessions: %o", e);
  }
  return new Map();
}

/**
 * Helper function get settings and handle errors.
 * @returns User settings.
 */
async function getSettings(): Promise<Map<string, Setting>> {
  const logger = await getBackgroundLogger();
  try {
    return await settings.get();
  } catch (e) {
    logger.error("Failed to get settings: %o", e);
  }
  return new Map();
}

/**
 * Terminate all sessions.
 */
async function logoutAll(): Promise<void> {
  const logger = await getBackgroundLogger();
  const currentSessions = await getSessions();
  for (let [host, session] of currentSessions) {
    auth.logout(host, session.token).catch(logger.warn);
  }
}

/**
 * Calculate the time in ms before the session should time out.
 * @param createdAt Timestamp when the session was created.
 * @param maxTokenLife Max number of hours the token is allowed to stay alive.
 */
function getWhen(maxTokenLifeHours: number, createdAt: number): number {
  const maxTokenLifeMs = maxTokenLifeHours * 36e5;
  return createdAt + maxTokenLifeMs;
}

async function onIdleMaxChanged(
  idleMaxMinutes: number | undefined
): Promise<void> {
  const logger = await getBackgroundLogger();
  idleMaxMinutes = idleMaxMinutes ?? -1;
  logger.info(`Updated idle interval to ${idleMaxMinutes} minutes`);
  browser.idle.setDetectionInterval(idleMaxMinutes * 60);
  browser;
}

/**
 * Set a periodic alarm to refresh the server lifetime of the session token.
 * Should be called on startup or when a new session has been added.
 * @param host Host associated with the session.
 * @param session New session.
 */
async function setKeepAliveAlarm(host: string, session: Session) {
  const logger = await getBackgroundLogger();
  logger.info(`Setting up keepalive for ${host}`);
  // Set timeout to 75% of server timeout to leave some margin
  const timeout = (session.timeout * 0.75) / 6e4;
  const name = genAlarmName(ALARM_KEEP_ALIVE, host, session.token);
  browser.alarms.create(name, { when: Date.now(), periodInMinutes: timeout });
}

/**
 * Clears the periodic alarm for refreshing the server lifetime of the session token.
 * Should be called when a session has been removed.
 * @param host Host associated with the session.
 * @param session Deleted session.
 */
async function clearKeepAliveAlarm(host: string, session: Session) {
  const logger = await getBackgroundLogger();
  logger.info(`Clearing keepalive for ${host}`);
  const name = genAlarmName(ALARM_KEEP_ALIVE, host, session.token);
  browser.alarms.clear(name);
}

/**
 * Clear alarm that would invalidate a session.
 * Should be called when a session has been invalidated by other means,
 * leaving the alarm no longer relevant.
 * @param host Host associated with the removed session.
 * @param session Removed session.
 */
async function clearHardTimeoutAlarm(host: string, session: Session) {
  const logger = await getBackgroundLogger();
  logger.debug(`Clearing hard timeout for ${host}.`);
  browser.alarms.clear(genAlarmName(ALARM_HARD_TIMEOUT, host, session.token));
}

/**
 * Set an alarm to invalidate a session after a set amount of time from when it was created.
 * If `maxTokenLifeHours` is 0, any existing alarm will be cleared.
 * If the time for the alarm has already passed, the session will be invalidated immediately.
 * @param maxTokenLifeHours Hours since the token was concieved before it should be invalidated.
 * @param host The host associated with the session.
 * @param session Session to be invalidated.
 */
async function setHardtimeoutAlarm(
  maxTokenLifeHours: number | undefined,
  host: string,
  session: Session
): Promise<void> {
  maxTokenLifeHours = maxTokenLifeHours ?? 0;
  const logger = await getBackgroundLogger();
  const hostAlarmName = genAlarmName(ALARM_HARD_TIMEOUT, host, session.token);

  // Clear old alarm if it exists
  let hostAlarm = await browser.alarms.get(hostAlarmName);
  if (hostAlarm) {
    browser.alarms.clear(hostAlarmName);
  }

  if (maxTokenLifeHours === 0) return; // Don't set up new alarm if 0

  // Create new alarm
  const now = Date.now();
  const when = getWhen(maxTokenLifeHours, session.createdAt);
  const diff = when - now;
  logger.info(
    `Hard timeout for ${host} in ${diff}ms (<${Math.ceil(diff / 6e4)}m)`
  );
  browser.alarms.create(hostAlarmName, { when });
}

/**
 * Set the browser action icon to reflect the online status.
 * @param isOnline `true` if at least one active session exists.
 */
function setIcon(isOnline: boolean): void {
  const icon = isOnline ? "icon" : "icon-inactive";
  browser.action.setIcon({
    path: {
      48: `assets/${icon}_48.png`,
      96: `assets/${icon}_96.png`,
    },
  });
}

async function setTabResultsCount(tabId: number) {
  const count = (await tabresults.getTabResults(tabId)).length;
  if (count > 0) {
    await browser.action.setBadgeText({
      text: count.toString(),
      tabId,
    });
  } else {
    await browser.action.setBadgeText({
      text: "",
      tabId,
    });
  }
}

/**
 * Get the decrypted version of the StoredSafe object.
 * If the object is already decrypted, it will return as is.
 *
 * If the object contains no encrypted fields, it will return without
 * calling the decrypt API.
 * @param result StoredSafe object.
 * @returns Decrypted StoredSafe object.
 */
async function getDecryptedObject(result: StoredSafeObject) {
  // If the object is already decrypted, return it.
  if (result.isDecrypted) return result;
  for (const field of result.fields) {
    // Decrypt and return if an encrypted field is found.
    if (field.isEncrypted) {
      const currentSessions = await sessions.get();
      const token = currentSessions.get(result.host)?.token;
      if (!token)
        throw new StoredSafeExtensionError("Session for result is offline.");
      return await vault.decryptObject(result.host, token, result);
    }
  }
  // There were no fields to decrypt.
  return result;
}

/**
 * Ensure the StoredSafe object is decrypted and formatted to be filled
 * by the content script. Then send the result to the content script.
 * @param result StoredSafe Object.
 */
async function fill(
  tab: browser.tabs.Tab | undefined,
  url: string | undefined,
  result: StoredSafeObject
): Promise<any> {
  const logger = await getBackgroundLogger();
  if (!tab || !url) {
    logger.warn("Trying to fill forms on invalid tab.");
    return;
  }
  url = stripURL(url);
  await preferences.setAutoFillPreferences(url, {
    host: result.host,
    objectId: result.id,
  });
  result = await getDecryptedObject(result);
  const values: Record<string, string> = {};
  for (const field of result.fields) {
    values[field.name] = field.value ?? "";
  }
  return sendTabMessage({
    from: Context.BACKGROUND,
    to: Context.CONTENT_SCRIPT,
    action: "fill",
    data: values,
  });
}

/**
 * Returns active tab if it is within the scope of the browser extension,
 * otherwise null.
 */
async function getActiveTab(): Promise<browser.tabs.Tab | undefined> {
  const activeTabs = await browser.tabs.query({
    currentWindow: true,
    active: true,
  });
  if (activeTabs.length <= 0) return undefined;
  const tab = activeTabs[0];
  if (!tab.id || !tab.url || !tab.url.match(/https?:\/\//)) return undefined;
  if (await browser.permissions.contains({ origins: [tab.url] })) return tab;
  // No permissions on tab url
  return undefined;
}

/**
 * Fill forms on the active tab based on related search results.
 *
 * If there are no search results, do nothing.
 * If there is one search result, fill that result.
 * If there are multiple results, fill the most recently used, or prompt the user.
 */
async function quickFill(
  tab: browser.tabs.Tab | undefined,
  url: string | undefined
) {
  // Invalid tab for fill, exit
  if (!tab?.id || !url) return;
  const tabResults = await getTabResults(tab.id);

  // No results for the current page, exit
  if (tabResults.length === 0) return;

  // If there is only one result, fill and exit
  if (tabResults.length === 1) {
    fill(tab, url, tabResults[0]);
    return;
  }

  // Check if the user has a last used object among the results for this page
  // If yes, fill and exit
  const autoFillPreference = (await preferences.get()).autoFill.get(
    stripURL(url)
  );
  if (autoFillPreference) {
    const tabResult = tabResults.find(
      ({ host, id }) =>
        id === autoFillPreference.objectId && host === autoFillPreference.host
    );
    if (tabResult) {
      fill(tab, url, tabResult);
      return;
    }
  }

  // Open iframe to ask user to select a result
  sendTabMessage({
    from: Context.BACKGROUND,
    to: Context.CONTENT_SCRIPT,
    action: "iframe.create",
    data: { id: "fill" },
  });
}

/**
 * Search the currently active StoredSafe hosts for results related
 * to the current tab.
 * @param tab The active tab
 * @param searchHosts Optionally limit search to specific hosts (for new logins)
 */
async function updateTabResults(
  tab: browser.tabs.Tab | undefined,
  url: string | undefined,
  searchHosts: string[] | null = null
): Promise<StoredSafeObject[]> {
  const logger = await getBackgroundLogger();
  // Invalid tab for search, exit
  if (!tab?.id || !url) return [];

  // Store promise to indicate a search is in progress (used for auto fill)
  const promise = autoSearch(url, searchHosts);
  tabResultsPromises.set(tab.id, promise);

  const results = await promise;
  logger.debug(`Found ${results.length} results for tab`);
  tabResultsPromises.delete(tab.id);

  // Update tab results in the extension session storage
  await tabresults.add(tab.id, results);
  // Update the extension badge to indicate found results
  setTabResultsCount(tab.id);
  return results;
}

/**
 * Helper function to find out whether or not a StoredSafe object already
 * exists with the provided values.
 * @param tabResults Results from auto search, related to current tab.
 * @param url Formatted URL of current tab.
 * @param username Username in the form that started this flow.
 * @returns true if matching results are found.
 */
export function matchingObjectExists(
  tabResults: StoredSafeObject[],
  url: string,
  username: string
) {
  /**
   * Check if there is an existing StoredSafe object matching the provided result.
   * @param result Result currently being compared.
   * @returns true if both username and URL match the result
   */
  function matchResult(result: StoredSafeObject): boolean {
    let matchUsername = false;
    let matchURL = false;
    for (const field of result.fields) {
      // Check for username matches
      if (field.name === "username" && field.value === username) {
        matchUsername = true;
      }
      // Check for URL matches
      if (
        (field.name === "url" || field.name === "host") &&
        field.value?.split("?")[0] === url.split("?")[0]
      ) {
        matchURL = true;
      }
    }
    return matchUsername && matchURL;
  }

  return tabResults.findIndex(matchResult) !== -1;
}
