import { PromiseReducer } from './PromiseReducer';
import * as Sites from '../model/Sites';

export interface State {
  sites: {
    collections: Sites.SiteCollection;
    list: Sites.Site[];
  };
}

export interface Action {
  type: 'add' | 'remove' | 'fetch';
  id?: number;
  site?: Sites.Site;
}

export const reducer: PromiseReducer<State, Action> = (
  state,
  action
) => {
  const onSuccess = (sites: Sites.SiteCollection): State => ({
    sites: {
      collections: sites,
      list: sites.system.concat(sites.user),
    },
  });

  switch (action.type) {
    case 'add': {
      return Sites.get().then((sites) => {
        const newSites: Sites.SiteCollection = {
          system: sites.system,
          user: [
            ...sites.user,
            action.site,
          ],
        };
        return Sites.set(newSites).then(() => onSuccess(newSites));
      })
    }
    case 'remove': {
      return Sites.get().then((sites) => {
        const newSites = {
          system: sites.system,
          user: sites.user.filter((site, id) => action.id !== id)
        };
        return Sites.set(newSites).then(() => onSuccess(newSites));
      });
    }
    case 'fetch': {
      return Sites.get().then((sites) => onSuccess(sites));
    }
    default: {
      throw new Error(`Invalid type: ${action.type}`);
    }
  }
};

export const emptyState: State = {
  sites: { collections: { system: [], user: [] }, list: [] },
};

export const init = (): Promise<State> => (
  reducer(emptyState, { type: 'fetch' })
);

