import '@testing-library/jest-dom'

window.browser = {
  i18n: {
    getMessage: jest.fn(() => 'MESSAGE'),
    ...window.browser?.i18n
  },
  ...window.browser
}