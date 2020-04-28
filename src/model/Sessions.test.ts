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

  test('get(), empty', () => (
    Sessions.get().then((sessions) => {
      expect(Object.keys(sessions).length).toBe(0);
    })
  ));

  test('get(), incomplete sessions object', () => {
    localGetMock.mockImplementationOnce(mockGet({}));
    return Sessions.get().then((sessions) => {
      expect(Object.keys(sessions).length).toBe(0);
    })
  });

  test('get(), values exist', () => {
    const mockSessions: Sessions.Sessions = {
      'foo.example.com': {
        apikey: 'mockapikey',
        token: 'mocktoken',
        createdAt: 0,
        lastActive: 0,
      },
    };
    localGetMock.mockImplementationOnce(mockGet(mockSessions));
    return Sessions.get().then((sessions) => {
      expect(sessions).toBe(mockSessions);
    })
  });

  test('set()', () => {
    const mockSessions: Sessions.Sessions = {
      'foo.example.com': {
        apikey: 'mockapikey',
        token: 'mocktoken',
        createdAt: 0,
        lastActive: 0,
      },
    };
    return Sessions.set(mockSessions).then(() => {
      expect(localSetMock).toHaveBeenCalledWith({
        sessions: mockSessions
      });
    })
  });
});
