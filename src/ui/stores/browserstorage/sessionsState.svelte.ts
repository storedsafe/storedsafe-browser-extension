import * as auth from "@/global/api/auth";
import { sessions as sessionsStorage } from "@/global/storage";
import { loading } from "../loading.svelte";

export const SESSIONS_LOADING_ID = "sessions.loading";
export const SESSIONS_LOGIN_LOADING_ID = "sessions.login.totp";
export const SESSIONS_LOGOUT_LOADING_ID = "sessions.logout";
export const SESSIONS_CLEAR_LOADING_ID = "sessions.clear";

class SessionsState {
  isInitialized: boolean = $state(false);
  data: SessionsMap = $state(new Map());

  constructor() {
    const promise = sessionsStorage.subscribe(this.#update.bind(this));
    loading.add(SESSIONS_LOADING_ID, promise, {
      onSuccess: (data) => {
        this.isInitialized = true;
        this.data = data;
      },
    });
  }

  loginTotp = auth.loginTotp;
  loginYubikey = auth.loginYubikey;
  logout = auth.logout;
  check = auth.check;

  #update(newValue: SessionsMap, _oldValue: SessionsMap) {
    this.data = newValue;
  }
}

export const sessions = new SessionsState();
