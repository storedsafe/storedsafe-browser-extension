module.exports = {
  env: {
    node: true,
    browser: true,
    es6: true,
    'jest/globals': true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    browser: 'readonly',
    storedsafe: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    'react',
    'jest',
    'jsx-a11y',
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'graphics/',
  ],
  rules: {
    'no-prototype-builtins': 'off',
    'no-underscore-dangle': 'off',
    'no-param-reassign': 'off',
    'max-len': ["error", { "code": 80 }],
    'import/no-extraneous-dependencies': ['error', {
      'devDependencies': [
        '**/*.test.js',
        '**/setup_tests.js',
        '**/webpack.config.js',
        'gulpfile.js',
      ],
    }],
    'no-plusplus': ['error', { 'allowForLoopAfterthoughts': true }],
    'object-curly-newline': ["error", { "consistent": true }],
  },
};
