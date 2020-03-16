const settings = {
  sites: {},
  maxIdle: 15,
  maxTokenLife: 180,
  autoFill: false,
  theme: 'dark',
};

const sessions = {
  current: null,
  sessions: {}
};

const managedSettings = {
  enforced: {},
  defaults: {},
};

module.exports = Object.freeze({
  settings,
  sessions,
  managedSettings,
});
