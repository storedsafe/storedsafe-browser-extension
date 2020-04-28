import { PromiseReducer } from './PromiseReducer';
import * as Sessions from '../model/Sessions';

export interface State {
  sessions: Sessions.Sessions;
}

export interface Action {
  type: 'add' | 'remove' | 'fetch';
  url?: string;
  session?: Sessions.Session;
}

export const reducer: PromiseReducer<State, Action> = (
  state,
  action
) => {
  switch (action.type) {
    case 'add': {
      return Sessions.get().then((sessions) => {
        const newSessions = {
          ...sessions,
          [action.url]: action.session,
        };
        return Sessions.set(newSessions).then(() => ({ sessions: newSessions }));
      })
    }
    case 'remove': {
      return Sessions.get().then((sessions) => {
        const urls = Object.keys(sessions).filter((url) => url !== action.url);
        const newSessions: Sessions.Sessions = {};
        urls.forEach((url) => newSessions[url] = sessions[url]);
        return Sessions.set(newSessions).then(() => ({ sessions: newSessions }));
      });
    }
    case 'fetch': {
      return Sessions.get().then((sessions) => {
        return { sessions }
      });
    }
    default: {
      throw new Error(`Invalid type: ${action.type}`);
    }
  }
};

export const emptyState: State = {
  sessions: {},
};

export const init = (): Promise<State> => (
  reducer(emptyState, { type: 'fetch' })
);

