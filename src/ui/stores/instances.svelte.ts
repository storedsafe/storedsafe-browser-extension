import { sessions } from "@/global/storage";
import { vault } from "@/global/api";
import { Logger } from "@/global/logger";
import { loading } from "./loading.svelte";
import { SvelteMap } from "svelte/reactivity";

const logger = new Logger("instances");

export const INSTANCES_LOADING_ID = "instances.loading";
export const INSTANCES_REFRESH_LOADING_ID = "instances.refresh";

type Host = string;
export interface StoredSafeInstance {
  session: Session;
  vaults: StoredSafeVault[];
  templates: StoredSafeTemplate[];
  policies: StoredSafePasswordPolicy[];
}

class StoredSafeInstances {
  isInitialized: boolean = $state(false);
  instances: Map<Host, StoredSafeInstance> = $state(new SvelteMap());

  constructor() {
    this.onSessionsChanged = this.onSessionsChanged.bind(this);
    const promise = sessions.subscribe(this.onSessionsChanged);
    loading.add(INSTANCES_LOADING_ID, promise, {
      onSuccess: (data) => {
        this.onSessionsChanged(data, new Map());
      },
    });
  }

  onSessionsChanged(
    newValue: Map<string, Session>,
    _oldValues: Map<string, Session>
  ) {
    logger.debug("Sessions changed.");
    const sessions = newValue;
    const instances: Map<Host, StoredSafeInstance> = new Map(this.instances);

    for (const host of instances.keys()) {
      if (!sessions.has(host)) {
        logger.debug("Deleting instance for %s", host);
        instances.delete(host);
      }
    }

    for (const [host, session] of sessions.entries()) {
      const loadingId = `${INSTANCES_REFRESH_LOADING_ID}.${host}`;
      logger.debug("Loading instance data for %s...", host);
      const promises = Promise.all([
        vault.getVaults(host, session.token),
        vault.getTemplates(host, session.token),
        vault.getPolicies(host, session.token),
      ]);
      const onSuccess = ([vaults, templates, policies]: [
        StoredSafeVault[],
        StoredSafeTemplate[],
        StoredSafePasswordPolicy[]
      ]) => {
        logger.debug("Updated instance data for %s", host);
        instances.set(host, {
          session,
          vaults,
          templates,
          policies,
        });
        // Sort instances to ensure consistent order
        this.instances = new SvelteMap(
          instances.entries().toArray().sort(this.#sortInstances)
        );
        this.isInitialized = true;
      };
      const onError = logger.error;
      loading.add(loadingId, promises, { onSuccess, onError });
    }
  }

  #sortInstances(
    a: [string, StoredSafeInstance],
    b: [string, StoredSafeInstance]
  ): number {
    return a[0].toUpperCase() < b[0].toUpperCase() ? -1 : 1;
  }
}

export const instances = new StoredSafeInstances();
