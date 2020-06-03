module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  rootDir: 'src',
  setupFilesAfterEnv: ['<rootDir>setupTests.ts'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': "<rootDir>__mocks__/fileMock.js",
    '\\.(css|scss)$': "<rootDir>__mocks__/styleMock.js",
  },
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/index.tsx',
    '!**/index.ts',
    '!**/*.stories.tsx',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  coverageDirectory: '<rootDir>../coverage',
};
