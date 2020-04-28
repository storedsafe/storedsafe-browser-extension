export {}

declare global {
  namespace NodeJS {
    interface Global {
      browser: {
        storage: {
          local?: {
            get: jest.Mock<Promise<object>, string[]>;
            set: jest.Mock<Promise<void>, object[]>;
          };
          sync?: {
            get: jest.Mock<Promise<object>, string[]>;
            set: jest.Mock<Promise<void>, object[]>;
          };
          managed?: {
            get: jest.Mock;
          };
        };
      };
    }
  }
}


