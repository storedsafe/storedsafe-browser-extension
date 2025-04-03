/**
 * Background script for StoredSafe browser extension.
 *
 * Takes case of the following:
 *  - [ ] Perform searches in StoredSafe on new tabs
 *  - [x] Keep storedsafe token alive while the browser is active
 *  - [x] Log out when the browser turns idle
 *  - [x] Log out after the token reaches its maximum lifespan
 *    - This behaviour is unique to the browser extension because the workflow
 *      is slightly different from how the server timeout for the token is.
 *    - This serves as a way to counter the risks of the keepalive feature in the
 *      browser extension.
 *  - [ ] Pass information between popup/iframe and content script
*     - [ ] autofill
*     - [ ] fill
*     - [ ] save
 *  - [x] Set badge icon when user goes online/offline
 *  - [ ] Set badge label when search results are found
 */
import { auth } from "@/global/api";
import { getLogger } from "../global/logger";
import { sessions, settings } from "../global/storage";
import {
  ALARM_HARD_TIMEOUT,
  ALARM_KEEP_ALIVE,
  genAlarmName,
  splitAlarmName,
} from "./constants";

const getBackgroundLogger = async () => getLogger("background");

////////////////////////////// ON STARTUP //////////////////////////////

getBackgroundLogger().then((logger) => {
  logger.log("Background script loaded.");
});

// These functions will only apply the newValues field,
// and the 2nd parameter will default to the empty version.
// This way everything will be deteced as a change.
getSettings().then(onSettingsChanged);
getSessions().then(onSessionsChanged);

////////////////////////////// EVENT HANDLERS //////////////////////////////

/**
 * Search for result related to the current tab when the tab changes.
 * Skip search if results already exist for the tab.
 */
browser.tabs.onActivated.addListener(async (activeInfo) => {
  const logger = await getBackgroundLogger();
  logger.debug("Changed tab to %o", activeInfo.tabId);
});

/**
 * Listen for incoming messages from content script and popup.
 *  - ... TODO: Document incoming messages
 */
browser.runtime.onMessage.addListener(async (message, sender, respond) => {
  const logger = await getBackgroundLogger();
  logger.debug("Incoming message: %o", message?.msg);
});

/**
 * Listen for incoming connections from content script and popup.
 *  - ... TODO: Document incoming connections
 */
browser.runtime.onConnect.addListener(async (port) => {
  const logger = await getBackgroundLogger();
  logger.debug("Connected to %o", port.name);
});

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

////////////////////////////// HELPER FUNCTIONS //////////////////////////////

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
 * Set up alarms for new sessions and delete alarms for removed sessions.
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
      setHardtimeoutAlarm(maxTokenLifeHours, host, session);
      setKeepAliveAlarm(host, session);
    }
  }

  // Clear alarms for removed sessions
  for (const [host, session] of oldSessions) {
    wasOnline = true; // at least one session existed
    const hostAlarmName = genAlarmName(ALARM_HARD_TIMEOUT, host, session.token);
    if (!newSessions.has(host)) {
      logger.info(`Session removed for ${host}, updating session alarms...`);
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

/**
 * Set up alarms for invalidating sessions after the hard lifetime limit.
 * If maxTokenLife is 0, clear all session alarms.
 * @param maxTokenLifeHours The max amount of hours a token is allowed to be active.
 */
async function onMaxTokenLifeChanged(maxTokenLifeHours: number): Promise<void> {
  const logger = await getBackgroundLogger();
  const current_sessions = await getSessions();

  logger.log("maxTokenLife changed, updating session alarms...");
  for (let [host, session] of current_sessions) {
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
    case ALARM_KEEP_ALIVE: {
      const [host, token] = parts;
      logger.info("Keepalive triggered for %s", host);
      auth.check(host, token).catch(console.warn);
      break;
    }
    case ALARM_HARD_TIMEOUT: {
      const [host, token] = parts;
      logger.info(`Hard timeout, invalidating session for ${host}`);
      auth.logout(host, token).catch(logger.warn);
    }
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
  const current_sessions = await getSessions();
  for (let [host, session] of current_sessions) {
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
