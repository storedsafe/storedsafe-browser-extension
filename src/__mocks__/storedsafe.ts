/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Mock server imitating StoredSafe for testing.
 * */
import {
  StoredSafeErrorData,
  StoredSafeLoginData,
  StoredSafeLogoutData,
  StoredSafeData,
  StoredSafeObjectData,
  StoredSafeCreateObjectData,
  StoredSafeCheckData,
  StoredSafePasswordData,
  StoredSafeVaultData,
  StoredSafeTemplateData
} from 'storedsafe'

export const data = {
  check: require('./fixtures/storedsafe_check.json') as StoredSafeCheckData,
  createObject: require('./fixtures/storedsafe_create_object.json') as StoredSafeCreateObjectData,
  decrypt: require('./fixtures/storedsafe_decrypt.json') as StoredSafeObjectData,
  error: require('./fixtures/storedsafe_error') as StoredSafeErrorData,
  find: require('./fixtures/storedsafe_find.json') as StoredSafeObjectData,
  loginTotp: require('./fixtures/storedsafe_login_totp.json') as StoredSafeLoginData,
  loginTotpWarning: require('./fixtures/storedsafe_login_totp_audit.json') as StoredSafeLoginData,
  loginYubikey: require('./fixtures/storedsafe_login_yubikey.json') as StoredSafeLoginData,
  logout: require('./fixtures/storedsafe_logout.json') as StoredSafeLogoutData,
  password: require('./fixtures/storedsafe_password.json') as StoredSafePasswordData,
  vaults: require('./fixtures/storedsafe_vaults.json') as StoredSafeVaultData,
  vaultsEmpty: require('./fixtures/storedsafe_vaults_empty.json') as StoredSafeVaultData,
  templates: require('./fixtures/storedsafe_templates.json') as StoredSafeTemplateData
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

  async makeOkResponse (responseData: StoredSafeData): Promise<MockResponse> {
    return await Promise.resolve({
      status: 200,
      statusText: 'success',
      data: responseData
    })
  }

  makeErrorResponse (
    message: string,
    responseData = data.error,
    status = 403,
    statusText = 'error'
  ): MockError {
    return {
      name: 'name',
      message,
      response: {
        status: status,
        statusText: statusText,
        data: responseData
      }
    }
  }

  async loginTotp (
    username: string,
    passphrase: string,
    otp: string
  ): Promise<MockResponse> {
    if (
      (this.host === 'login' || this.host === 'audit') &&
      this.apikey === 'apikey' &&
      username === 'username' &&
      passphrase === 'passphrase' &&
      otp === 'otp'
    ) {
      const loginData =
        this.host === 'login' ? data.loginTotp : data.loginTotpWarning
      return await this.makeOkResponse(loginData)
    }
    throw this.makeErrorResponse('totp error')
  }

  async loginYubikey (
    username: string,
    passphrase: string,
    otp: string
  ): Promise<MockResponse> {
    if (
      this.host === 'login' &&
      this.apikey === 'apikey' &&
      username === 'username' &&
      passphrase === 'passphrase' &&
      otp === 'oooooooooooooooooooooooooooooooooooooooooooo'
    ) {
      return await this.makeOkResponse(data.loginYubikey)
    }
    throw await this.makeErrorResponse('login error')
  }

  async logout (): Promise<MockResponse> {
    if (
      (this.host === 'host' || this.host === 'login') &&
      this.token === 'token'
    ) {
      return await this.makeOkResponse(data.logout)
    }
    throw this.makeErrorResponse('logout error')
  }

  // Use check endpoint to test network errors
  async check (): Promise<MockResponse> {
    if (this.host === 'host' || this.host === 'login') {
      if (this.token === 'token') {
        return await this.makeOkResponse(data.check)
      } else if (this.token === '500') {
        const error: MockError = {
          name: 'name',
          message: 'server error',
          request: {
            status: 500,
            statusText: 'internal server error'
          }
        }
        throw error
      } else {
        const error: Error = {
          name: 'name',
          message: 'request error'
        }
        throw error
      }
    }
    throw this.makeErrorResponse('check error')
  }

  async find (needle: string): Promise<MockResponse> {
    if (this.host === 'host' && this.token === 'token' && needle === 'server') {
      return await this.makeOkResponse(data.find)
    }
    throw this.makeErrorResponse('find error')
  }

  async decryptObject (id: string): Promise<MockResponse> {
    if (this.host === 'host' && this.token === 'token' && id === '1') {
      return await this.makeOkResponse(data.decrypt)
    }
    throw this.makeErrorResponse('decrypt error')
  }

  async createObject (params: object): Promise<MockResponse> {
    if (
      this.host === 'host' &&
      this.token === 'token' &&
      params !== undefined
    ) {
      return await this.makeOkResponse(data.createObject)
    }
    throw this.makeErrorResponse('create object error')
  }

  async listVaults (): Promise<MockResponse> {
    if (this.host === 'host' && this.token === 'token') {
      return await this.makeOkResponse(data.vaults)
    }
    if (this.host === 'audit' && this.token === 'token') {
      const error: MockError = {
        name: 'name',
        message: 'vaults empty error',
        response: {
          status: 404,
          statusText: 'statusText',
          data: data.vaultsEmpty
        }
      }
      throw error
    }
    throw this.makeErrorResponse('list vaults error')
  }

  async listTemplates (): Promise<MockResponse> {
    if (
      (this.host === 'host' || this.host === 'audit') &&
      this.token === 'token'
    ) {
      return await this.makeOkResponse(data.templates)
    }
    throw this.makeErrorResponse('list templates error')
  }

  async generatePassword (): Promise<MockResponse> {
    if (this.host === 'host' && this.token === 'token') {
      return await this.makeOkResponse(data.password)
    }
    throw this.makeErrorResponse('generate password response')
  }
}
