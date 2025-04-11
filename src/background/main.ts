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
 *  - [ ] Pass information between popup/iframe and content script
 *    - [ ] on connection:
 *            - [x] content script connects to background script
 *            - [x] background script checks if user is logged in (if not, do nothing)
 *            - [x] background script tells content script to scan for forms
 *            - [x] content script returns found forms to background script (if no forms, do nothing)
 *            - [x] background script checks for relevant results in StoredSafe (if none, do nothing)
 *            - [x] results are stored in session storage (for fill and popup)
 *            - [ ] background script checks if autofill is enabled (if not, do nothing)
 *            - [ ] start fill
 *     - [ ] fill (hotkey/auto)
 *            AUTO
 *            - see on connection
 *            HOTKEY
 *            - [ ] background script detects hotkey pressed
 *            - [ ] background script checks if results exist for current tab (if not, do nothing)
 *            BOTH
 *            - [ ] if multiple results exist, check preferences
 *            - [ ] if no preferences are found, tell content script to open iframe for selection
 *            SELECTION
 *            - [ ] content script receives message to open iframe
 *            - [ ] content script opens iframe for fill preferences
 *            - [ ] background script receives connection from iframe
 *            - [ ] background script sends suggested results to iframe
 *            - [ ] iframe displays results and waits for user selection
 *            - [ ] iframe sends selection to background script
 *            - [ ] background script saves item to preferences for current site
 *            - [ ] background script tells content script to fill form
 *     - [ ] fill (from popup)
 *            - [x] popup tells background script to fill with chosen storedsafe object
 *            - [x] background script saves item to preferences for current site
 *            - [x] background script tells content script to fill with chosen storedsafe object
 *            - [x] content script scans for forms to fill, fills if found
 *     - [ ] save
 *            - [ ] content script sets up listeners for submit events
 *            - [ ] user submits form
 *            - [ ] content script sends message to background script with login info
 *            - [ ] background script checks for active sessions and save/ignore preferences (if no save, do nothing)
 *            REPEAT UNTIL TIMEOUT/COMPLETE (accounting for page redirects)
 *            - [ ] background script tells content script to open iframe
 *            - [ ] content script opens iframe for saving object
 *            - [ ] background script receives connection from iframe
 *            - [ ] background script sends save data to iframe
 *            - [ ] iframe displays results and waits for user selection
 *            - [ ] iframe saves object in storedsafe
 *  - [x] Set badge icon when user goes online/offline
 *  - [x] Set badge label when search results are found
 */
import { auth, vault } from "@/global/api";
import { getLogger } from "../global/logger";
import { preferences, sessions, settings, tabresults } from "../global/storage";
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
import type { FormType } from "@/content_script/tasks/scanner";
import { autoSearch } from "./tasks/autoSearch";
import { stripURL } from "@/global/storage/preferences";
import { StoredSafeExtensionError } from "@/global/errors";

const context = Context.BACKGROUND;
const getBackgroundLogger = async () => getLogger("background");

type MessageHandler = (
  message: Message,
  sender: browser.runtime.MessageSender
) => void;

const MESSAGE_HANDLERS: {
  [context: string]: {
    [action: string]: MessageHandler;
  };
} = {
  [Context.CONTENT_SCRIPT]: {
    connect: onContentScriptConnect,
    forms: onContentScriptForms,
  },
  [Context.POPUP]: {
    "tabresults.get": onGetTabResults,
    fill: onFill,
  },
};

////////////////////////////// ON STARTUP //////////////////////////////

getBackgroundLogger().then((logger) => {
  logger.log("Background script loaded.");
});

// These functions will only apply the newValues field,
// and the 2nd parameter will default to the empty version.
// This way everything will be detected as a change.
getSettings().then(onSettingsChanged);
getSessions().then(onSessionsChanged);

////////////////////////////// EVENT HANDLERS //////////////////////////////

browser.tabs.onActivated.addListener(
  async (activeInfo: browser.tabs._OnActivatedActiveInfo) => {
    setTabResultsCount(activeInfo.tabId);
  }
);

/**
 * Listen for incoming messages from content script and popup.
 *  - Content script returns found forms, check for autofill and populate search
 *    context: content_script
 *    action: scan
 *    data: forms
 *  - Tab iframe notifies that a form on the page should be filled
 *    context: iframe
 *    action: fill
 *    data: form, storedsafe object
 */
browser.runtime.onMessage.addListener(
  messageListener(async (message, sender) => {
    const logger = await getBackgroundLogger();
    logger.debug("Incoming message: %o", message);
    const messageHandler = MESSAGE_HANDLERS[message.context]?.[message.action];
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

browser.alarms.onAlarm.addListener(onAlarmTriggered);

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
  logger.debug("Start scan");
  return {
    context,
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
  const formTypes: FormType[] = message.data?.formTypes;
  const searchHosts: string[] | null = message.data?.hosts ?? null;
  const tabId = sender.tab.id;
  const results = await autoSearch(sender.url, formTypes, searchHosts);
  logger.debug(`Found ${results.length} results for tab`);
  await tabresults.add(tabId, results);
  setTabResultsCount(tabId);
}

/**
 * If the content script finds any forms after scanning, perform a search
 * in StoredSafe for potentially related objects.
 *
 * These results will be put into the extension session storage where they can
 * be fetched by the popup to pre-populate the search window.
 */
async function onGetTabResults() {
  if (!(await isOnline())) return [];
  const tabId = (await getActiveTab())?.id;
  if (!tabId) return [];
  return await tabresults.getTabResults(tabId);
}

async function onFill(message: Message) {
  const logger = await getBackgroundLogger();
  if (!(await isOnline())) return;
  if (!message.data) {
    logger.warn("Requested fill without any data.");
  }
  fill(message.data);
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
    if (key === "idleMax") {
      onIdleMaxChanged(setting.value as number | undefined);
    } else if (key === "maxTokenLife") {
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
  const setting = (await getSettings()).get("maxTokenLife");
  let maxTokenLifeHours = 0;
  if (setting) maxTokenLifeHours = setting.value as number;

  let isOnline = false;
  let wasOnline = false;

  // Set up alarms for new sessions
  for (const [host, session] of newSessions) {
    isOnline = true; // at least one session exists
    if (!oldSessions.has(host)) {
      logger.info(`New session found for ${host}, updating session alarms...`);
      sendTabMessage({
        context,
        action: "scan",
        data: { hosts: [host] },
      });
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

  // Update online status on badge
  if (isOnline != wasOnline) {
    setIcon(isOnline);
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

  logger.log("maxTokenLife changed, updating session alarms...");
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
  logger.log(`Clearing hard timeout for ${host}.`);
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
async function fill(result: StoredSafeObject): Promise<any> {
  const logger = await getBackgroundLogger();
  const tab = await getActiveTab();
  if (!tab || !tab.url) {
    logger.warn("Trying to fill forms on invalid tab.");
    return;
  }
  const url = stripURL(tab.url);
  await preferences.setAutoFillPreferences(url, {
    host: result.host,
    objectId: result.id,
  });
  result = await getDecryptedObject(result);
  const values: Record<string, string> = {};
  for (const field of result.fields) {
    values[field.name] = field.value ?? "";
  }
  return sendTabMessage({ context, action: "fill", data: values });
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
  if (!tab.id || !tab.url) return undefined;
  if (await browser.permissions.contains({ origins: [tab.url] })) return tab;
  // No permissions on tab url
  return undefined;
}
