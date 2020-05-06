import { PromiseReducer } from '../PromiseReducer';
import { Sessions, Session } from '../../model/Sessions';

export interface State {
  sessions: Sessions;
}

export interface Action {
  type: 'add' | 'remove' | 'fetch';
  url?: string;
  session?: Session;
}

const halt = (
  wait = Math.floor(Math.random() * 500)
): Promise<void> => (
  new Promise((resolve) => setTimeout(resolve, wait))
);

let mockSessions: Sessions = {
  'safe.example.com': {
    apikey: 'abc123',
    token: 'q1w2e3r4t5',
    createdAt: Date.now(),
  },
  'd1.myvault.io': {
    apikey: 'xyz789',
    token: 'a1b2c3d4e5',
    createdAt: Date.now(),
  },
}

const MockSessions = {
  get: (): Promise<Sessions> => (
    halt().then(() => mockSessions)
  ),
  set: (sessions: Sessions): Promise<void> => {
    mockSessions = sessions;
    return halt();
  },
};

export const reducer: PromiseReducer<State, Action> = (
  state,
  action
) => {
  switch (action.type) {
    case 'add': {
      return MockSessions.get().then((sessions) => {
        const newSessions = {
          ...sessions,
          [action.url]: action.session,
        };
        return MockSessions.set(newSessions).then(() => ({ sessions: newSessions }));
      })
    }
    case 'remove': {
      return MockSessions.get().then((sessions) => {
        const urls = Object.keys(sessions).filter((url) => url !== action.url);
        const newSessions: Sessions = {};
        urls.forEach((url) => newSessions[url] = sessions[url]);
        return MockSessions.set(newSessions).then(() => ({ sessions: newSessions }));
      });
    }
    case 'fetch': {
      return MockSessions.get().then((sessions) => {
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

