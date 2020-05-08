const localSetMock = jest.fn(() => Promise.resolve());
//eslint-disable-next-line
const localGetMock = jest.fn((key: string) => Promise.resolve({}));
const mockGet = (
  values: object
): (key: string) => Promise<object> => (key: string): Promise<object> => {
  if (key === 'sessions') {
    return Promise.resolve({ [key]: values });
  }
  throw new Error('Invalid key');
};

global.browser = {
  storage: {
    local:  {
      get: localGetMock,
      set: localSetMock,
    },
  }
};

import * as Sessions from './Sessions';

describe('uses mocked browser.storage', () => {
  beforeEach(() => {
    localSetMock.mockClear();
    localGetMock.mockClear();
  });

  test('fetch(), empty', () => (
    Sessions.actions.fetch().then((sessions) => {
      expect(Object.keys(sessions).length).toBe(0);
    })
  ));

  test('fetch(), incomplete sessions object', () => {
    localGetMock.mockImplementationOnce(mockGet({}));
    return Sessions.actions.fetch().then((sessions) => {
      expect(Object.keys(sessions).length).toBe(0);
    })
  });

  test('fetch(), values exist', () => {
    const mockSessions: Sessions.Sessions = {
      'foo.example.com': {
        apikey: 'mockapikey',
        token: 'mocktoken',
        createdAt: 0,
      },
    };
    localGetMock.mockImplementationOnce(mockGet(mockSessions));
    return Sessions.actions.fetch().then((sessions) => {
      expect(sessions).toBe(mockSessions);
    })
  });

  test('add()', () => {
    const url = 'add.example.com';
    const session: Sessions.Session = {
      apikey: 'addapikey',
      token: 'addktoken',
      createdAt: 0,
    };
    const newSessions: Sessions.Sessions = {
      [url]: session,
    };
    localGetMock.mockImplementationOnce(mockGet({}));
    localGetMock.mockImplementationOnce(mockGet(newSessions));
    return Sessions.actions.add(url, session).then((sessions) => {
      expect(localSetMock).toHaveBeenCalledWith({
        sessions: newSessions
      });
      expect(sessions).toEqual(newSessions);
    })
  });

  test('remove()', () => {
    const url = 'remove.example.com';
    const session: Sessions.Session = {
      apikey: 'removeapikey',
      token: 'removetoken',
      createdAt: 0,
    };
    const mockSessions: Sessions.Sessions = {
      [url]: session,
    };
    localGetMock.mockImplementationOnce(mockGet(mockSessions));
    return Sessions.actions.remove(url).then((sessions) => {
      expect(localSetMock).toHaveBeenCalledWith({
        sessions: {},
      });
      expect(sessions).toEqual({});
    })
  });

  test('clear()', () => {
    return Sessions.actions.clear().then((sessions) => {
      expect(localSetMock).toHaveBeenCalledWith({
        sessions: {},
      });
      expect(sessions).toEqual({});
    })
  });
});
