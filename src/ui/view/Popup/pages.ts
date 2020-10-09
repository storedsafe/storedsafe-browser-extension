import { getMessage, LocalizedMessage } from '../../../global/i18n'
import {
  addIcon,
  optionsIcon,
  pwgenIcon,
  vaultIcon,
  vaultOpenIcon
} from '../../../global/icons'

// Define pages available for navigation
export enum Page {
  WELCOME = 'welcome',
  SEARCH = 'search',
  ADD = 'add',
  GENERATE_PASSWORD = 'pwgen',
  SESSIONS = 'sessions',
  OPTIONS = 'options',
  DEBUG = 'debug'
}

// Main menu to be shown when online
export const mainMenu = [
  {
    title: getMessage(LocalizedMessage.MENU_SESSIONS),
    icon: vaultOpenIcon,
    name: Page.SESSIONS
  },
  {
    title: getMessage(LocalizedMessage.MENU_ADD),
    icon: addIcon,
    name: Page.ADD
  },
  {
    title: getMessage(LocalizedMessage.MENU_GENERATE_PASSWORD),
    icon: pwgenIcon,
    name: Page.GENERATE_PASSWORD
  },
  {
    title: getMessage(LocalizedMessage.MENU_OPTIONS),
    icon: optionsIcon,
    name: Page.OPTIONS
  }
]

export const offlineMenu = [
  {
    title: getMessage(LocalizedMessage.MENU_SESSIONS),
    icon: vaultIcon,
    name: Page.SESSIONS
  },
  {
    title: getMessage(LocalizedMessage.MENU_OPTIONS),
    icon: optionsIcon,
    name: Page.OPTIONS
  }
]
