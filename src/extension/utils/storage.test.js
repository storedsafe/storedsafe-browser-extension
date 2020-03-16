global.browser = {
  storage: {
    local: { get: jest.fn(), set: jest.fn(), remove: jest.fn(), clear: jest.fn() },
    sync: { get: jest.fn(), set: jest.fn(), remove: jest.fn(), clear: jest.fn() },
    managed: { get: jest.fn(), set: jest.fn(), remove: jest.fn(), clear: jest.fn() },
  },
};

const storage = require('./storage');
const defaults = require('./defaults');

const getStorageValue = (value) => {
  return (key) => {
    return new Promise((resolve, reject) => resolve({[key]: storage.merge(value, {})}));
  };
};
const passPromise = (key) => new Promise((resolve, reject) => resolve({}));

const mockSystemSettings = {
  enforced: {
    sites: {
      'system.storedsafe.com': {
        apikey: 'very-sercret-key',
      },
    },
    maxTokenLife: 180,
  },
  defaults: {
    maxIdle: 15,
    autoFill: true,
  },
};

const mockUserSettings = {
  sites: {
    'system.storedsafe.com': {
      apikey: 'sneaky-user-key',
      username: 'oscar',
    },
    'user.storedsafe.com': {
      apikey: 'user-secret-key',
      username: 'chosenwan',
    },
  },
  maxIdle: 60,
};

const alterUserSettings = {
  sites: {
    'system.storedsafe.com': {
      username: 'john',
    },
  },
  maxIdle: 15,
};

const newUserSettings = {
  sites: {
    'system.storedsafe.com': {
      apikey: 'sneaky-user-key',
      username: 'john',
    },
    'user.storedsafe.com': {
      apikey: 'user-secret-key',
      username: 'chosenwan',
    },
  },
  maxIdle: 15,
};

const removeArray = ['sites', 'user.storedsafe.com'];
const reducedUserSettings = {
  sites: {
    'system.storedsafe.com': {
      apikey: 'sneaky-user-key',
      username: 'oscar',
    },
  },
  maxIdle: 60,
};

const mergedSites = {
  'system.storedsafe.com': {
    apikey: 'very-sercret-key',
    username: 'oscar',
  },
  'user.storedsafe.com': {
    apikey: 'user-secret-key',
    username: 'chosenwan',
  },
};

const mockSessions = Object.freeze({
  current: 'user.storedsafe.com',
  sessions: {
    'system.storedsafe.com': {
      token: 'abc123',
      createdAt: 0,
      lastActive: 1000,
    },
    'user.storedsafe.com': {
      token: '123abc',
      createdAt: 1000,
      lastActive: 3500,
    },
  },
});

const newMockSessions = {
  ...mockSessions,
  current: 'system.storedsafe.com',
};

test(".merge(priorityObject, fillObject)", () => {
  const result = storage.merge(mockSystemSettings.enforced.sites, mockUserSettings.sites);
  expect(result).toEqual(mergedSites);
});

describe("Gets settings object", () => {
  beforeEach(() => {
    browser.storage.managed.get
      .mockImplementationOnce(getStorageValue(mockSystemSettings));
    browser.storage.sync.get
      .mockImplementationOnce(getStorageValue(mockUserSettings));

  });

  test(".getStorageValue(key), found in managed", () => {
    return storage.getSettings('maxTokenLife').then(value => {
      expect(value).toBe(mockSystemSettings.enforced.maxTokenLife);
      expect(browser.storage.managed.get).toHaveBeenCalledWith('settings');
      expect(browser.storage.sync.get).not.toHaveBeenCalledWith('settings');
    });
  })

  test(".getStorageValue(key), fallback to sync", () => {
    return storage.getSettings('maxIdle').then(value => {
      expect(value).toBe(mockUserSettings.maxIdle);
      expect(browser.storage.managed.get).toHaveBeenCalledWith('settings');
      expect(browser.storage.sync.get).toHaveBeenCalledWith('settings');
    });
  })

  test(".getStorageValue(key), fallback to managed default", () => {
    return storage.getSettings('autoFill').then(value => {
      expect(value).toBe(mockSystemSettings.defaults.autoFill);
      expect(browser.storage.managed.get).toHaveBeenCalledWith('settings');
      expect(browser.storage.sync.get).toHaveBeenCalledWith('settings');
    });
  })

  test(".getStorageValue(key), fallback to hard coded default", () => {
    return storage.getSettings('theme').then(value => {
      expect(value).toBe(defaults.settings.theme);
      expect(browser.storage.managed.get).toHaveBeenCalledWith('settings');
      expect(browser.storage.sync.get).toHaveBeenCalledWith('settings');
    });
  })

  test(".getStorageValue(key), throws error if no value is found", () => {
    return storage.getSettings('mockfail').catch(error => {
      expect(error).toContain('mockfail');
      expect(browser.storage.managed.get).toHaveBeenCalledWith('settings');
      expect(browser.storage.sync.get).toHaveBeenCalledWith('settings');
    });
  })

  test(".getStorageValue(key), returns merged site object", () => {
    return storage.getSettings('sites').then(value => {
      expect(value).toEqual(mergedSites);
      expect(browser.storage.managed.get).toHaveBeenCalledWith('settings');
      expect(browser.storage.sync.get).toHaveBeenCalledWith('settings');
    });
  })

  test("getAllSettings()", () => {
    return storage.getAllSettings().then(settings => {
      expect(settings).toHaveProperty('system');
      expect(settings.system).toEqual(mockSystemSettings.enforced);
      expect(settings).toHaveProperty('user');
      expect(settings.user).toEqual(mockUserSettings);
      expect(settings).toHaveProperty('defaults');
      expect(settings.defaults).toEqual(storage.merge(
        mockSystemSettings.defaults, defaults.settings));
      expect(browser.storage.managed.get).toHaveBeenCalledWith('settings');
      expect(browser.storage.sync.get).toHaveBeenCalledWith('settings');
    });
  });
});

describe("Gets and sets sync", () => {

  beforeEach(() => {
    browser.storage.sync.get
      .mockImplementationOnce(getStorageValue(mockUserSettings));
    browser.storage.sync.set
      .mockImplementationOnce(passPromise);
  });

  test(".updateUserSettings(settingsObj)", () => {
    return storage.updateUserSettings(alterUserSettings)
      .then(newSettings => {
        expect(newSettings).toEqual(newUserSettings);
        expect(browser.storage.sync.set)
          .toHaveBeenCalledWith({ settings: newSettings });
      });
  });

  test(".removeUserSettingsField(fieldArray)", () => {
    return storage.removeUserSettingsField(removeArray)
      .then(newSettings => {
        expect(newSettings).toEqual(reducedUserSettings)
        expect(browser.storage.sync.set)
          .toHaveBeenCalledWith({ settings: newSettings });
      });
  });

  test(".removeUserSettingsField(fieldArray), fails with invalid path", () => {
    return storage.removeUserSettingsField(['mock', 'invalid'])
      .catch(error => {
        expect(error).toContain('mock, invalid');
      });
  });
});

test(".getActiveSession(), no existing sessions", () => {
  browser.storage.local.get
    .mockImplementationOnce(passPromise);
  const site = mockSessions.current;
  return storage.getActiveSession()
    .then(session => {
      expect(session).toEqual(null);
    });
});

describe("Gets sessions object", () => {

  beforeEach(() => {
    browser.storage.local.get
      .mockImplementationOnce(getStorageValue(mockSessions));
  });

  afterEach(() => {
    expect(browser.storage.local.get).toHaveBeenCalledWith('sessions');
  });

  test(".getActiveSession()", () => {
    const site = mockSessions.current;
    return storage.getActiveSession()
      .then(session => {
        expect(session).toEqual(mockSessions.sessions[site]);
      });
  });

  test(".getAllSessions()", () => {
    return storage.getAllSessions()
      .then(sessions => {
        expect(sessions).toEqual(mockSessions);
      });
  });

  describe("Gets and sets local", () => {

    beforeEach(() => {
      browser.storage.local.set
        .mockImplementationOnce(passPromise);
    });

    test(".setActiveSession(site)", () => {
      const site = newMockSessions.current;
      return storage.setActiveSession(site)
        .then(newSession => {
          expect(newSession).toEqual(mockSessions.sessions[site]);
          expect(browser.storage.local.set)
            .toHaveBeenCalledWith({ 'sessions': newMockSessions });
        });
    });

    test(".setActiveSession(site), site doesn't exist", () => {
      const site = 'mock.storedsafe.com';
      return storage.setActiveSession(site)
        .catch(error => {
          expect(error).toContain(site);
        });
    });

    test(".createSession(site, token)", () => {
      const site = 'new.storedsafe.com';
      const token = 'new-token';
      const createdAt = 5000;
      const mockCreateSession = {
        token,
        createdAt,
        lastActive: createdAt,
      };
      const newSessions = {
        current: site,
        sessions: {
          ...mockSessions.sessions,
          [site]: mockCreateSession,
        }
      };

      Date.now = jest.fn().mockImplementationOnce(() => createdAt);
      return storage.createSession(site, token)
        .then(session => {
          expect(session).toEqual(newSessions)
          expect(browser.storage.local.set)
            .toHaveBeenCalledWith({ 'sessions': newSessions });
        });
    });

    test(".updateSessionLastActive()", () => {
      const lastActive = 6500;
      Date.now = jest.fn().mockImplementationOnce(() => lastActive);
      const site = mockSessions.current;
      const updatedSessions = storage.merge(mockSessions, {});
      updatedSessions.sessions[site].lastActive = lastActive;

      return storage.updateSessionLastActive()
        .then(session => {
          expect(session).toEqual({...mockSessions.sessions[site], lastActive});
          expect(browser.storage.local.set)
            .toHaveBeenCalledWith({ 'sessions': updatedSessions });
        });
    });

    test(".removeSession()", () => {
      const site = 'user.storedsafe.com';
      const removedSessions = storage.merge(mockSessions, {});
      delete removedSessions.sessions[site];
      return storage.removeSession(site)
        .then(session => {
          expect(session).toEqual(mockSessions.sessions[site]);
          expect(browser.storage.local.set)
            .toHaveBeenCalledWith({ 'sessions': removedSessions });
        });
    });

    test(".clearSessions()", () => {
      return storage.clearSessions()
        .then(() => {
          expect(browser.storage.local.set)
            .toHaveBeenCalledWith({ 'sessions': defaults.sessions });
        });
    });
  });
});
