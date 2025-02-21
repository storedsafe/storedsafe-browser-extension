import { sessions } from "@/global/storage";
import { vault } from "@/global/api";
import { Logger } from "@/global/logger";
import { loading } from "./loading.svelte";

const logger = new Logger("structure");

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
  instances: Map<Host, StoredSafeInstance> = $state(new Map());

  constructor() {
    this.onSessionsChanged = this.onSessionsChanged.bind(this);
    const promise = sessions.subscribe(this.onSessionsChanged);
    loading.add(INSTANCES_LOADING_ID, promise, {
      onSuccess: (data) => this.onSessionsChanged(data, new Map()),
    });
  }

  onSessionsChanged(
    newValue: Map<string, Session>,
    _oldValues: Map<string, Session>
  ) {
    const sessions = newValue;
    const instances: Map<Host, StoredSafeInstance> = new Map(this.instances);

    for (const host of instances.keys()) {
      if (!sessions.has(host)) {
        instances.delete(host);
      }
    }

    for (const [host, session] of sessions.entries()) {
      const loadingId = `${INSTANCES_REFRESH_LOADING_ID}.${host}`;
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
        instances.set(host, {
          session,
          vaults,
          templates,
          policies,
        });
      };
      const onError = logger.error;
      loading.add(loadingId, promises, { onSuccess, onError });
    }
    // Sort instances to ensure consistent order
    this.instances = new Map(
      instances.entries().toArray().sort(this.#sortInstances)
    );
  }

  #sortInstances(
    a: [string, StoredSafeInstance],
    b: [string, StoredSafeInstance]
  ): number {
    return a[0].toUpperCase() < b[0].toUpperCase() ? -1 : 1;
  }
}

export const instances = new StoredSafeInstances();
