import * as auth from "@/global/api/auth";
import { sessions as sessionsStorage } from "@/global/storage";
import { loading } from "../loading.svelte";
import { SvelteMap } from "svelte/reactivity";
import { Logger } from "@/global/logger";

const logger = new Logger("sessions");

export const SESSIONS_LOADING_ID = "sessions.loading";
export const SESSIONS_CHECK_LOADING_ID = "sessions.loading";
export const SESSIONS_LOGIN_LOADING_ID = "sessions.login.totp";
export const SESSIONS_LOGOUT_LOADING_ID = "sessions.logout";
export const SESSIONS_CLEAR_LOADING_ID = "sessions.clear";

class SessionsState {
  isInitialized: boolean = $state(false);
  data: SessionsMap = $state(new SvelteMap());

  constructor() {
    const promise = sessionsStorage.subscribe(this.#update.bind(this));
    loading.add(SESSIONS_LOADING_ID, promise, {
      onSuccess: async (data) => {
        logger.debug("Sessions loaded from storage.");
        this.#update(data, this.data);
        const loadingPromises = [];
        for (const [host, session] of data) {
          // Check that sessions are still alive on startup
          loadingPromises.push(auth.check(host, session.token));
        }
        loading.add(SESSIONS_CHECK_LOADING_ID, Promise.all(loadingPromises), {
          onSuccess: () => {
            logger.debug("All sessions verified.");
            this.isInitialized = true;
          },
        });
      },
    });
  }

  loginTotp = auth.loginTotp;
  loginYubikey = auth.loginYubikey;
  logout = auth.logout;
  check = auth.check;

  #update(newValue: SessionsMap, _oldValue: SessionsMap) {
    this.data = new SvelteMap(newValue);
  }
}

export const sessions = new SessionsState();
