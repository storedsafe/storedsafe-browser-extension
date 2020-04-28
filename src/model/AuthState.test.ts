const localSetMock = jest.fn(() => Promise.resolve());
//eslint-disable-next-line
const localGetMock = jest.fn((key: string) => Promise.resolve({}));
const mockGet = (
  values: object
): (key: string) => Promise<object> => (key: string): Promise<object> => {
  if (key === 'authState') {
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

import * as AuthState from './AuthState';

describe('uses mocked browser.storage', () => {
  beforeEach(() => {
    localSetMock.mockClear();
    localGetMock.mockClear();
  });

  test('get(), empty', () => (
    AuthState.get().then(({ usernames, selected }) => {
      expect(Object.keys(usernames).length).toBe(0);
      expect(selected).toBe(undefined);
    })
  ));

  test('get(), no data', () => {
    localGetMock.mockImplementationOnce(mockGet({}));
    return AuthState.get().then(({ usernames, selected }) => {
      expect(Object.keys(usernames).length).toBe(0);
      expect(selected).toBe(undefined);
    });
  });

  test('get(), with data', () => {
    const mockAuthProperties: AuthState.AuthState = {
      usernames: { 'foo.example.com': 'mockusername' },
      selected: 'bar.example.com',
    }
    localGetMock.mockImplementationOnce(mockGet(mockAuthProperties));
    return AuthState.get().then(({ usernames, selected }) => {
      expect(usernames).toBe(mockAuthProperties.usernames);
      expect(usernames['foo.example.com']).toBe('mockusername');
      expect(selected).toBe('bar.example.com');
    });
  });

  test('set()', () => {
    const mockAuthProperties: AuthState.AuthState = {
      usernames: { 'foo.example.com': 'mockusername' },
      selected: 'bar.example.com',
    }
    return AuthState.set(mockAuthProperties).then(() => {
      expect(localSetMock).toHaveBeenCalledWith({ authState: mockAuthProperties });
    });
  });
});
