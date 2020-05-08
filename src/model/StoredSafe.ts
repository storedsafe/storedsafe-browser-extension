import StoredSafe, {
  StoredSafePromise,
  StoredSafeResponse,
} from 'storedsafe';
import { actions as sessions, Session } from './Sessions';
import { Site } from './Sites';

export type LoginType = 'yubikey' | 'totp';

export interface TOTPFields {
  username: string;
  passphrase: string;
  otp: string;
}

export interface YubiKeyFields {
  username: string;
  keys: string;
}

export type LoginFields = TOTPFields | YubiKeyFields;

const handleErrors = (promise: StoredSafePromise): Promise<StoredSafeResponse> => (
  promise.then((response) => {
    if (response.status === 200) {
      return response.data;
    }
    throw new Error(`StoredSafe Error: (${response.status}) ${response.statusText}`);
  }).catch((error) => {
    if (error.response) {
      throw new Error(`StoredSafe Error: ${error.response.data.ERRORS}`);
    } else if (error.request) {
      throw new Error(`Network Error: (${error.request.status}) ${error.request.statusText}`);
    }
    throw new Error(`Unexpected Error: ${error}`);
  })
);

export const actions = {
  login: (
    { url, apikey }: Site,
    loginType: LoginType,
    fields: LoginFields
  ): Promise<StoredSafeResponse> => {
    const storedSafe = new StoredSafe(url, apikey);
    let promise: StoredSafePromise;
    if (loginType === 'yubikey') {
      const { username, keys } = fields as YubiKeyFields;
      const passphrase = keys.slice(0, -44);
      const otp = keys.slice(-44);
      promise = storedSafe.authYubikey(username, passphrase, otp);
    } else if (loginType === 'totp') {
      const {
        username,
        passphrase,
        otp,
      } = fields as TOTPFields;
      promise = storedSafe.authTotp(username, passphrase, otp);
    }
    return handleErrors(promise).then((data) => {
      const { token } = data.CALLINFO;
      sessions.add(url, {
        apikey,
        token,
        createdAt: Date.now(),
      });
      return data;
    });
  },

  logout: (url: string, { apikey, token }: Session): Promise<StoredSafeResponse> => {
    const storedSafe = new StoredSafe(url, apikey, token);
    return handleErrors(storedSafe.logout()).then((data) => (
      sessions.remove(url).then(() => data)
    ));
  },

  find: (
    needle: string,
    url: string,
    { apikey, token }: Session
  ): Promise<StoredSafeResponse> => {
    const storedSafe = new StoredSafe(url, apikey, token);
    return handleErrors(storedSafe.find(needle)).then((data) => (
      data
    ));
  },
};
