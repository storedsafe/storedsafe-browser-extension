const defaults = require('./defaults');

const local = browser.storage.local;
const sync = browser.storage.sync;
const managed = browser.storage.managed;

const Fields = Object.freeze({
  SETTINGS: 'settings',
  SESSIONS: 'sessions',
});

function merge(system, user) {
  let merged = {};
  let sk = Object.keys(system);
  let uk = Object.keys(user);
  let union = [];
  sk.forEach(key => {
    union.push(key);
    if(_isObject(system[key]) && _isObject(user[key])) {
      merged[key] = merge(system[key], user[key]);
    }
    else if (Array.isArray(system[key]) && Array.isArray(user[key]))
      merged[key] = system[key].concat(user[key]);
    else if (system[key] !== undefined)
      merged[key] = system[key];
    else if (user[key] !== undefined)
      merged[key] = user[key]
  });
  const remainder = uk.filter(key => !union.includes(key));
  remainder.forEach(key => merged[key] = user[key]);
  return merged;
}

function _isObject(obj) {
  return typeof obj === 'object' && !Array.isArray(obj) && obj !== null;
}

function _getManagedSettings() {
  return managed.get(Fields.SETTINGS).then(values => {
    if (values.hasOwnProperty(Fields.SETTINGS))
      return values[Fields.SETTINGS];
    else
      return defaults.managedSettings;
  });
}

function _getSyncSettings() {
  return sync.get(Fields.SETTINGS).then(values => {
    if (values.hasOwnProperty(Fields.SETTINGS))
      return values[Fields.SETTINGS];
    else
      return {};
  });
}

function _setSyncSettings(settings) {
  return sync.set({ [Fields.SETTINGS]: settings }).then(() => {
    return settings;
  });
}

function _getLocalSessions() {
  return local.get(Fields.SESSIONS).then(values => {
    if (values.hasOwnProperty(Fields.SESSIONS))
      return values[Fields.SESSIONS];
    else
      return defaults.sessions;
  });
}

function _setLocalSessions(sessions) {
  return local.set({ [Fields.SESSIONS]: sessions}).then(() => {
    return sessions;
  });
}

module.exports = Object.freeze({
  getSettings: (key) => {
    return _getManagedSettings().then(settings => {
      let value;
      if (settings.enforced.hasOwnProperty(key)) {
        value = settings.enforced[key];
        if (!_isObject(value))
          return value;
      }
      const managedDefaults = settings.defaults;
      return _getSyncSettings().then(settings => {
        if (settings.hasOwnProperty(key)) {
          if (_isObject(value))
            return merge(value, settings[key]);
          else
            return settings[key];
        }
        if (managedDefaults.hasOwnProperty(key))
          return managedDefaults[key];
        if (defaults.settings.hasOwnProperty(key))
          return defaults.settings[key];
        throw `Invalid key: ${key}`;
      });
    });
  },

  getAllSettings: () => {
    return _getManagedSettings().then(systemSettings => {
      return _getSyncSettings().then(userSettings => {
        return {
          system: systemSettings.enforced,
          user: userSettings,
          defaults: merge(systemSettings.defaults, defaults.settings),
        };
      });
    });
  },

  updateUserSettings: (newSettings) => {
    return _getSyncSettings().then(settings => {
      return _setSyncSettings(merge(newSettings, settings));
    });
  },

  removeUserSettingsField: (fieldPath) => {
    return _getSyncSettings().then(settings => {
      let parent = settings;
      fieldPath.slice(0, -1).forEach(key => {
        if (!parent.hasOwnProperty(key))
          throw `Invalid path: [${fieldPath.join(', ')}]`;
        parent = parent[key];
      });
      delete parent[fieldPath.pop()];
      return _setSyncSettings(settings);
    });
  },

  getActiveSession: () => {
    return _getLocalSessions().then(sessions => {
      if (sessions.current !== null)
        return sessions.sessions[sessions.current];
      return null;
    });
  },

  getAllSessions: () => {
    return _getLocalSessions();
  },

  setActiveSession: (site) => {
    return _getLocalSessions().then(sessions => {
      if(sessions.sessions.hasOwnProperty(site)) {
        sessions.current = site;
        return _setLocalSessions(sessions).then(sessions => sessions.sessions[site]);
      }
      throw `No session for site ${site}`;
    });
  },

  createSession: (site, token) => {
    return _getLocalSessions().then(sessions => {
      const now = Date.now();
      const newSession = {
        token,
        createdAt: now,
        lastActive: now,
      };
      sessions.current = site;
      sessions.sessions[site] = newSession;
      return _setLocalSessions(sessions);
    });
  },

  updateSessionLastActive: () => {
    return _getLocalSessions().then(sessions => {
      sessions.sessions[sessions.current].lastActive = Date.now();
      return _setLocalSessions(sessions)
        .then(sessions => sessions.sessions[sessions.current]);
    });
  },

  removeSession: (site) => {
    return _getLocalSessions().then(sessions => {
      const removedSession = sessions.sessions[site];
      delete sessions.sessions[site];
      if (sessions.current === site) sessions.current = null;
      return _setLocalSessions(sessions)
        .then(() => removedSession)
    });
  },

  clearSessions: () => {
    return _setLocalSessions(defaults.sessions);
  },

  merge,
});
