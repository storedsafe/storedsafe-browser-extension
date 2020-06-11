import { StoredSafeResponse } from 'storedsafe';

export const data: {
  [name: string]: StoredSafeResponse;
} = {
  error: {
    "ERRORS": [
      "Error 1",
      "Error 2"
    ],
    "ERRORCODES": {
      "2000": "Errormessages exists"
    },
    "DATA": {
    },
    "HEADERS": {
      "Host": "host",
    },
    "PARAMS": [],
    "CALLINFO": {
      "general": [],
      "handler": "AuthHandler",
      "status": "FAIL",
      "errors": 2,
      "errorcodes": 1
    }
  },

  loginTotp: {
    "DATA": {
      "username": "username",
      "passphrase": "passphrase",
      "otp": "515939",
      "apikey": "apikey",
      "logintype": "totp"
    },
    "HEADERS": {
      "Host": "host",
    },
    "PARAMS": [],
    "CALLINFO": {
      "token": "token",
      "fingerprint": "fingerprint",
      "userid": "1",
      "password": "passphrase",
      "userstatus": "396",
      "username": "username",
      "fullname": "First Last",
      "timeout": 14400000,
      "filesupport": 3,
      "version": "2.1.0",
      "audit": {
        "violations": {"key": "violation"},
        "warnings": []
      },
      "general": [
        "general"
      ],
      "handler": "AuthHandler",
      "status": "SUCCESS",
      "errors": 0,
      "errorcodes": 0
    }
  },

  loginYubikey: {
    "DATA": {
      "username": "user",
      "keys": "passphraseapikeytoken"
    },
    "HEADERS": {
      "Host": "host",
    },
    "PARAMS": [],
    "CALLINFO": {
      "token": "token",
      "fingerprint": "fingerprint",
      "userid": "1",
      "password": "passphrase",
      "userstatus": "396",
      "username": "username",
      "fullname": "First Last",
      "timeout": 14400000,
      "filesupport": 3,
      "version": "2.1.0",
      "audit": {
        "violations": {"key": "violation"},
        "warnings": []
      },
      "general": [
        "general"
      ],
      "handler": "AuthHandler",
      "status": "SUCCESS",
      "errors": 0,
      "errorcodes": 0
    }
  },

  logout: {
    "DATA": {
      "token": "token"
    },
    "HEADERS": {
      "Host": "host",
    },
    "PARAMS": [],
    "CALLINFO": {
      "token": "token",
      "logout": "Bye bye!",
      "general": [],
      "handler": "AuthHandler",
      "status": "SUCCESS",
      "errors": 0,
      "errorcodes": 0
    }
  },

  find: {
    "OBJECT": [
      {
        "id": "1",
        "parentid": "0",
        "templateid": "4",
        "groupid": "139",
        "status": "128",
        "objectname": "Host",
        "filename": "",
        "children": "0",
        "notes": false,
        "tags": "",
        "alarmed": false,
        "public": {
          "host": "Host",
          "username": "Username"
        }
      },
    ],
    "TEMPLATES": [
      {
        "id": "4",
        "info": {
          "id": "4",
          "name": "Login",
          "ico": "ico_server",
          "active": true,
          "wb": true
        },
        "structure": [
          {
            "translation": "Host / IP",
            "type": "text",
            "encrypted": false,
            "show": true,
            "policy": false,
            "alarm": false,
            "opt": false,
            "cc": false,
            "nc": false,
            "fieldname": "host"
          },
          {
            "translation": "Username",
            "type": "text",
            "encrypted": false,
            "show": true,
            "policy": false,
            "alarm": false,
            "opt": false,
            "cc": false,
            "nc": false,
            "log": true,
            "fieldname": "username"
          },
          {
            "translation": "Password",
            "type": "text-passwdgen",
            "encrypted": true,
            "show": true,
            "policy": true,
            "alarm": true,
            "opt": false,
            "cc": true,
            "nc": true,
            "fieldname": "password"
          }
        ]
      },
    ],
    "DATA": {
      "token": "token",
      "needle": "host"
    },
    "HEADERS": {
      "Host": "host",
    },
    "PARAMS": [],
    "CALLINFO": {
      "token": "token",
      "general": [],
      "handler": "FindHandler",
      "status": "SUCCESS",
      "errors": 0,
      "errorcodes": 0
    }
  },

  decrypt: {
    "OBJECT": [
      {
        "id": "1",
        "parentid": "0",
        "templateid": "4",
        "groupid": "139",
        "status": "128",
        "objectname": "Host",
        "filename": "",
        "children": "0",
        "notes": false,
        "tags": "",
        "alarmed": false,
        "public": {
          "host": "Host",
          "username": "Username"
        },
        "crypted": {
          "password": "Password"
        }
      }
    ],
    "TEMPLATES": [
      {
        "id": "4",
        "info": {
          "id": "4",
          "name": "Login",
          "ico": "ico_server",
          "active": true,
          "wb": true
        },
        "structure": [
          {
            "translation": "Host / IP",
            "type": "text",
            "encrypted": false,
            "show": true,
            "policy": false,
            "alarm": false,
            "opt": false,
            "cc": false,
            "nc": false,
            "fieldname": "host"
          },
          {
            "translation": "Username",
            "type": "text",
            "encrypted": false,
            "show": true,
            "policy": false,
            "alarm": false,
            "opt": false,
            "cc": false,
            "nc": false,
            "log": true,
            "fieldname": "username"
          },
          {
            "translation": "Password",
            "type": "text-passwdgen",
            "encrypted": true,
            "show": true,
            "policy": true,
            "alarm": true,
            "opt": false,
            "cc": true,
            "nc": true,
            "fieldname": "password"
          }
        ]
      }
    ],
    "BREADCRUMB": [
      {
        "objectid": "1",
        "objectname": "Host",
        "icon": "ico_server"
      }
    ],
    "DATA": {
      "token": "token",
      "decrypt": "true",
      "children": "false"
    },
    "HEADERS": {
      "Host": "host",
    },
    "PARAMS": [],
    "CALLINFO": {
      "token": "token",
      "general": [],
      "handler": "ObjectHandler",
      "status": "SUCCESS",
      "errors": 0,
      "errorcodes": 0
    }
  },
};

interface MockResponse {
  status: number;
  statusText: string;
  data: StoredSafeResponse;
}

interface MockError extends Error {
  response?: MockResponse;
  request?: {
    status: number;
    statusText: string;
  };
}

export default class StoredSafe {
  host: string;
  apikey?: string;
  token?: string;

  constructor({ host, apikey, token}: {
    host: string,
    apikey: string,
    token?: string
  }) {
    this.host = host;
    this.apikey = apikey;
    this.token = token;
  }

  loginTotp(
    username: string,
    passphrase: string,
    otp: string,
  ): Promise<MockResponse> {
    if (
      this.host === 'host' &&
      this.apikey === 'apikey' &&
      username === 'username' &&
      passphrase === 'passphrase' &&
      otp === 'otp'
    ) {
      return Promise.resolve({
        status: 200,
        statusText: 'success',
        data: data.loginTotp,
      });
    } else {
      const error: MockError = {
        name: 'name',
        message: 'message',
        response: {
          status: 403,
          statusText: 'login error',
          data: data.error,
        },
      };
      return Promise.reject(error);
    }
  }

  loginYubikey(
    username: string,
    passphrase: string,
    otp: string,
  ): Promise<MockResponse> {
    if (
      this.host === 'host' &&
      this.apikey === 'apikey' &&
      username === 'username' &&
      passphrase === 'passphrase' &&
      otp === 'oooooooooooooooooooooooooooooooooooooooooooo'
    ) {
      return Promise.resolve({
        status: 200,
        statusText: 'success',
        data: data.loginYubikey,
      });
    } else {
      const error: MockError = {
        name: 'name',
        message: 'message',
        response: {
          status: 403,
          statusText: 'login error',
          data: data.error,
        },
      };
      return Promise.reject(error);
    }
  }

  logout(): Promise<MockResponse> {
    if(
      this.host === 'host' &&
      this.apikey === 'apikey' &&
      this.token === 'token'
    ) {
      return Promise.resolve({
        status: 200,
        statusText: 'success',
        data: data.logout,
      });
    } else {
      const error: MockError = {
        name: 'name',
        message: 'message',
        response: {
          status: 403,
          statusText: 'logout error',
          data: data.error,
        },
      };
      return Promise.reject(error);
    }
  }

  find(needle: string): Promise<MockResponse> {
    if(
      this.host === 'host' &&
      this.apikey === 'apikey' &&
      this.token === 'token' &&
      needle === 'host'
    ) {
      return Promise.resolve({
        status: 200,
        statusText: 'success',
        data: data.find,
      });
    } else {
      const error: MockError = {
        name: 'name',
        message: 'message',
        response: {
          status: 403,
          statusText: 'find error',
          data: data.error,
        },
      };
      return Promise.reject(error);
    }
  }

  decryptObject(id: string): Promise<MockResponse> {
    if(
      this.host === 'host' &&
      this.apikey === 'apikey' &&
      this.token === 'token' &&
      id === '1'
    ) {
      return Promise.resolve({
        status: 200,
        statusText: 'success',
        data: data.decrypt,
      });
    } else {
      const error: MockError = {
        name: 'name',
        message: 'message',
        response: {
          status: 403,
          statusText: 'decrypt error',
          data: data.error,
        },
      };
      return Promise.reject(error);
    }
  }
}
