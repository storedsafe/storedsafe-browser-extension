export const sessions: Sessions = new Map([
  [
    'host',
    {
      apikey: 'abc123',
      token: 'token',
      createdAt: 1,
      warnings: {},
      violations: {},
      timeout: 14400000
    }
  ]
])
export const sSessions: SerializableSessions = [...sessions]

export const loginSessions: Sessions = new Map([
  ...sessions,
  [
    'login',
    {
      token: 'token',
      createdAt: 0,
      warnings: {},
      violations: {},
      timeout: 14400000
    }
  ]
])
export const sLoginSessions: SerializableSessions = [...loginSessions]

export const auditSessions: Sessions = new Map([
  ...sessions,
  [
    'audit',
    {
      token: 'token',
      createdAt: 0,
      warnings: { key: 'warning' },
      violations: { key: 'violation' },
      timeout: 14400000
    }
  ]
])
export const sAuditSessions: SerializableSessions = [...auditSessions]
