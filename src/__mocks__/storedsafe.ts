/**
 * Mock server imitating StoredSafe for testing.
 * */
import {
  StoredSafeResponse,
  StoredSafeCheckData,
  StoredSafeErrorData,
  StoredSafeLoginData,
  StoredSafeLogoutData,
  StoredSafeOtherData,
  StoredSafeData
} from 'storedsafe'

export const error: StoredSafeErrorData = {
  ERRORS: ['Error 1', 'Error 2'],
  ERRORCODES: {
    2000: 'Errormessages exists'
  },
  DATA: {},
  HEADERS: {
    Host: 'host'
  },
  PARAMS: [],
  CALLINFO: {
    general: [],
    handler: 'AuthHandler',
    status: 'FAIL',
    errors: 2,
    errorcodes: 1
  }
}

export const check: StoredSafeCheckData = {
  DATA: {
    token: 'token'
  },
  HEADERS: {
    Host: 'host'
  },
  PARAMS: [],
  CALLINFO: {
    token: 'token',
    general: [],
    handler: 'AuthHandler',
    status: 'SUCCESS',
    errors: 0,
    errorcodes: 0
  }
}

const loginTotp: StoredSafeLoginData = {
  DATA: {
    username: 'username',
    passphrase: 'passphrase',
    otp: '515939',
    apikey: 'apikey',
    logintype: 'totp'
  },
  HEADERS: {
    Host: 'host'
  },
  PARAMS: [],
  CALLINFO: {
    token: 'token',
    fingerprint: 'fingerprint',
    userid: '1',
    password: 'passphrase',
    userstatus: '396',
    username: 'username',
    fullname: 'First Last',
    timeout: 14400000,
    filesupport: 3,
    version: '2.1.0',
    audit: {
      violations: { key: 'violation' },
      warnings: []
    },
    general: ['general'],
    handler: 'AuthHandler',
    status: 'SUCCESS',
    errors: 0,
    errorcodes: 0
  }
}

const loginYubikey: StoredSafeLoginData = {
  DATA: {
    username: 'user',
    keys: 'passphraseapikeytoken'
  },
  HEADERS: {
    Host: 'host'
  },
  PARAMS: [],
  CALLINFO: {
    token: 'token',
    fingerprint: 'fingerprint',
    userid: '1',
    password: 'passphrase',
    userstatus: '396',
    username: 'username',
    fullname: 'First Last',
    timeout: 14400000,
    filesupport: 3,
    version: '2.1.0',
    audit: {
      violations: { key: 'violation' },
      warnings: []
    },
    general: ['general'],
    handler: 'AuthHandler',
    status: 'SUCCESS',
    errors: 0,
    errorcodes: 0
  }
}

const logout: StoredSafeLogoutData = {
  DATA: {
    token: 'token'
  },
  HEADERS: {
    Host: 'host'
  },
  PARAMS: [],
  CALLINFO: {
    token: 'token',
    logout: 'Bye bye!',
    general: [],
    handler: 'AuthHandler',
    status: 'SUCCESS',
    errors: 0,
    errorcodes: 0
  }
}

const find: StoredSafeOtherData = {
  OBJECT: [
    {
      id: '1',
      parentid: '0',
      templateid: '4',
      groupid: '139',
      status: '128',
      objectname: 'Host',
      filename: '',
      children: '0',
      notes: false,
      tags: '',
      alarmed: false,
      public: {
        host: 'Host',
        username: 'Username'
      }
    }
  ],
  TEMPLATES: [
    {
      id: '4',
      info: {
        id: '4',
        name: 'Login',
        ico: 'ico_server',
        active: true,
        wb: true
      },
      structure: [
        {
          translation: 'Host / IP',
          type: 'text',
          encrypted: false,
          show: true,
          policy: false,
          alarm: false,
          opt: false,
          cc: false,
          nc: false,
          fieldname: 'host'
        },
        {
          translation: 'Username',
          type: 'text',
          encrypted: false,
          show: true,
          policy: false,
          alarm: false,
          opt: false,
          cc: false,
          nc: false,
          log: true,
          fieldname: 'username'
        },
        {
          translation: 'Password',
          type: 'text-passwdgen',
          encrypted: true,
          show: true,
          policy: true,
          alarm: true,
          opt: false,
          cc: true,
          nc: true,
          fieldname: 'password'
        }
      ]
    }
  ],
  DATA: {
    token: 'token',
    needle: 'host'
  },
  HEADERS: {
    Host: 'host'
  },
  PARAMS: [],
  CALLINFO: {
    token: 'token',
    general: [],
    handler: 'FindHandler',
    status: 'SUCCESS',
    errors: 0,
    errorcodes: 0
  }
}

const decrypt: StoredSafeOtherData = {
  OBJECT: [
    {
      id: '1',
      parentid: '0',
      templateid: '4',
      groupid: '139',
      status: '128',
      objectname: 'Host',
      filename: '',
      children: '0',
      notes: false,
      tags: '',
      alarmed: false,
      public: {
        host: 'Host',
        username: 'Username'
      },
      crypted: {
        password: 'Password'
      }
    }
  ],
  TEMPLATES: [
    {
      id: '4',
      info: {
        id: '4',
        name: 'Login',
        ico: 'ico_server',
        active: true,
        wb: true
      },
      structure: [
        {
          translation: 'Host / IP',
          type: 'text',
          encrypted: false,
          show: true,
          policy: false,
          alarm: false,
          opt: false,
          cc: false,
          nc: false,
          fieldname: 'host'
        },
        {
          translation: 'Username',
          type: 'text',
          encrypted: false,
          show: true,
          policy: false,
          alarm: false,
          opt: false,
          cc: false,
          nc: false,
          log: true,
          fieldname: 'username'
        },
        {
          translation: 'Password',
          type: 'text-passwdgen',
          encrypted: true,
          show: true,
          policy: true,
          alarm: true,
          opt: false,
          cc: true,
          nc: true,
          fieldname: 'password'
        }
      ]
    }
  ],
  BREADCRUMB: [
    {
      objectid: '1',
      objectname: 'Host',
      icon: 'ico_server'
    }
  ],
  DATA: {
    token: 'token',
    decrypt: 'true',
    children: 'false'
  },
  HEADERS: {
    Host: 'host'
  },
  PARAMS: [],
  CALLINFO: {
    token: 'token',
    general: [],
    handler: 'ObjectHandler',
    status: 'SUCCESS',
    errors: 0,
    errorcodes: 0
  }
}

export const data = {
  check,
  decrypt,
  error,
  find,
  loginTotp,
  loginYubikey,
  logout
}

interface MockResponse {
  status: number
  statusText: string
  data: StoredSafeData
}

interface MockError extends Error {
  response?: MockResponse
  request?: {
    status: number
    statusText: string
  }
}

export default class StoredSafe {
  host: string
  apikey?: string
  token?: string

  constructor ({
    host,
    apikey,
    token
  }: {
    host: string
    apikey?: string
    token?: string
  }) {
    this.host = host
    this.apikey = apikey
    this.token = token
  }

  async loginTotp (
    username: string,
    passphrase: string,
    otp: string
  ): Promise<MockResponse> {
    if (
      this.host === 'host' &&
      this.apikey === 'apikey' &&
      username === 'username' &&
      passphrase === 'passphrase' &&
      otp === 'otp'
    ) {
      return await Promise.resolve({
        status: 200,
        statusText: 'success',
        data: data.loginTotp
      })
    } else {
      const error: MockError = {
        name: 'name',
        message: 'message',
        response: {
          status: 403,
          statusText: 'login error',
          data: data.error
        }
      }
      return await Promise.reject(error)
    }
  }

  async loginYubikey (
    username: string,
    passphrase: string,
    otp: string
  ): Promise<MockResponse> {
    if (
      this.host === 'host' &&
      this.apikey === 'apikey' &&
      username === 'username' &&
      passphrase === 'passphrase' &&
      otp === 'oooooooooooooooooooooooooooooooooooooooooooo'
    ) {
      return await Promise.resolve({
        status: 200,
        statusText: 'success',
        data: data.loginYubikey
      })
    } else {
      const error: MockError = {
        name: 'name',
        message: 'message',
        response: {
          status: 403,
          statusText: 'login error',
          data: data.error
        }
      }
      return await Promise.reject(error)
    }
  }

  async logout (): Promise<MockResponse> {
    if (this.host === 'host' && this.token === 'token') {
      return await Promise.resolve({
        status: 200,
        statusText: 'success',
        data: data.logout
      })
    } else {
      const error: MockError = {
        name: 'name',
        message: 'message',
        response: {
          status: 403,
          statusText: 'logout error',
          data: data.error
        }
      }
      return await Promise.reject(error)
    }
  }

  async check (): Promise<MockResponse> {
    if (
      (this.host === 'host' || this.host === 'other') &&
      this.token === 'token'
    ) {
      return await Promise.resolve({
        status: 200,
        statusText: 'success',
        data: data.check
      })
    } else {
      const error: MockError = {
        name: 'name',
        message: 'message',
        response: {
          status: 403,
          statusText: 'check error',
          data: data.error
        }
      }
      return await Promise.reject(error)
    }
  }

  async find (needle: string): Promise<MockResponse> {
    if (this.host === 'host' && this.token === 'token' && needle === 'host') {
      return await Promise.resolve({
        status: 200,
        statusText: 'success',
        data: data.find
      })
    } else {
      const error: MockError = {
        name: 'name',
        message: 'message',
        response: {
          status: 403,
          statusText: 'find error',
          data: data.error
        }
      }
      return await Promise.reject(error)
    }
  }

  async decryptObject (id: string): Promise<MockResponse> {
    if (this.host === 'host' && this.token === 'token' && id === '1') {
      return await Promise.resolve({
        status: 200,
        statusText: 'success',
        data: data.decrypt
      })
    } else {
      const error: MockError = {
        name: 'name',
        message: 'message',
        response: {
          status: 403,
          statusText: 'decrypt error',
          data: data.error
        }
      }
      return await Promise.reject(error)
    }
  }
}
