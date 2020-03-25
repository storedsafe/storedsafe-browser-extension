const defaults = require('./defaults');

const { local } = browser.storage;
const { sync } = browser.storage;
const { managed } = browser.storage;

const Fields = Object.freeze({
  SETTINGS: 'settings',
  SESSIONS: 'sessions',
});

function _isObject(obj) {
  return typeof obj === 'object' && !Array.isArray(obj) && obj !== null;
}

function merge(system, user) {
  const merged = {};
  const sk = Object.keys(system);
  const uk = Object.keys(user);
  const union = [];
  sk.forEach((key) => {
    union.push(key);
    if (_isObject(system[key]) && _isObject(user[key])) {
      merged[key] = merge(system[key], user[key]);
    } else if (Array.isArray(system[key]) && Array.isArray(user[key])) {
      merged[key] = system[key].concat(user[key]);
    } else if (system[key] !== undefined) {
      merged[key] = system[key];
    } else if (user[key] !== undefined) {
      merged[key] = user[key];
    }
  });
  const remainder = uk.filter((key) => !union.includes(key));
  remainder.forEach((key) => { merged[key] = user[key]; });
  return merged;
}

function _getManagedSettings() {
  return managed.get(Fields.SETTINGS).then((values) => {
    if (values.hasOwnProperty(Fields.SETTINGS)) return values[Fields.SETTINGS];
    return defaults.managedSettings;
  });
}

function _getSyncSettings() {
  return sync.get(Fields.SETTINGS).then((values) => {
    if (values.hasOwnProperty(Fields.SETTINGS)) return values[Fields.SETTINGS];
    return {};
  });
}

function _setSyncSettings(settings) {
  return sync.set({ [Fields.SETTINGS]: settings }).then(() => settings);
}

function _getLocalSessions() {
  return local.get(Fields.SESSIONS).then((values) => {
    if (values.hasOwnProperty(Fields.SESSIONS)) return values[Fields.SESSIONS];
    return defaults.sessions;
  });
}

function _setLocalSessions(sessions) {
  return local.set({ [Fields.SESSIONS]: sessions }).then(() => sessions);
}

module.exports = Object.freeze({
  getSettings: (key) => (
    _getManagedSettings().then((managedSettings) => {
      let value;
      if (managedSettings.enforced.hasOwnProperty(key)) {
        value = managedSettings.enforced[key];
        if (!_isObject(value)) {
          return value;
        }
      }
      const managedDefaults = managedSettings.defaults;
      return _getSyncSettings().then((syncSettings) => {
        if (syncSettings.hasOwnProperty(key)) {
          if (_isObject(value)) {
            return merge(value, syncSettings[key]);
          }
          return syncSettings[key];
        }
        if (managedDefaults.hasOwnProperty(key)) {
          return managedDefaults[key];
        }
        if (defaults.settings.hasOwnProperty(key)) {
          return defaults.settings[key];
        }
        throw new Error(`Invalid key: ${key}`);
      });
    })
  ),

  getAllSettings: () => (
    _getManagedSettings().then((systemSettings) => (
      _getSyncSettings().then((userSettings) => ({
        system: systemSettings.enforced,
        user: userSettings,
        defaults: merge(systemSettings.defaults, defaults.settings),
      }))
    ))
  ),

  updateUserSettings: (newSettings) => (
    _getSyncSettings().then((settings) => (
      _setSyncSettings(merge(newSettings, settings))
    ))
  ),

  removeUserSettingsField: (fieldPath) => (
    _getSyncSettings().then((settings) => {
      let parent = settings;
      fieldPath.slice(0, -1).forEach((key) => {
        if (!parent.hasOwnProperty(key)) {
          throw new Error(`Invalid path: [${fieldPath.join(', ')}]`);
        }
        parent = parent[key];
      });
      delete parent[fieldPath.pop()];
      return _setSyncSettings(settings);
    })
  ),

  getActiveSession: () => (
    _getLocalSessions().then((sessions) => {
      if (sessions.current !== null) return sessions.sessions[sessions.current];
      return null;
    })
  ),

  getAllSessions: () => (
    _getLocalSessions()
  ),

  setActiveSession: (site) => (
    _getLocalSessions().then((sessions) => {
      if (sessions.sessions.hasOwnProperty(site)) {
        sessions.current = site;
        return _setLocalSessions(sessions).then(
          (newSessions) => newSessions.sessions[site],
        );
      }
      throw new Error(`No session for site ${site}`);
    })
  ),

  createSession: (site, token) => (
    _getLocalSessions().then((sessions) => {
      const now = Date.now();
      const newSession = {
        token,
        createdAt: now,
        lastActive: now,
      };
      sessions.current = site;
      sessions.sessions[site] = newSession;
      return _setLocalSessions(sessions);
    })
  ),

  updateSessionLastActive: () => (
    _getLocalSessions().then((sessions) => {
      sessions.sessions[sessions.current].lastActive = Date.now();
      return _setLocalSessions(sessions)
        .then((newSessions) => newSessions.sessions[sessions.current]);
    })
  ),

  removeSession: (site) => (
    _getLocalSessions().then((sessions) => {
      const removedSession = sessions.sessions[site];
      delete sessions.sessions[site];
      if (sessions.current === site) sessions.current = null;
      return _setLocalSessions(sessions)
        .then(() => removedSession);
    })
  ),

  clearSessions: () => (
    _setLocalSessions(defaults.sessions)
  ),

  merge,
});
