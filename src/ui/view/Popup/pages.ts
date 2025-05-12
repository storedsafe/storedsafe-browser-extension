import { getMessage, LocalizedMessage } from "@/global/i18n";
import {
  addIcon,
  errorIcon,
  infoIcon,
  optionsIcon,
  pwgenIcon,
  searchIcon,
  storedSafeIcon,
  vaultOpenIcon,
  warningIcon,
} from "@/global/icons";
import Sessions from "../lib/pages/sessions/Sessions.svelte";
import Add from "../lib/pages/add/Add.svelte";
import PasswordGenerator from "../lib/pages/passwordGenerator/PasswordGenerator.svelte";
import Options from "../lib/pages/options/Options.svelte";
import type { Component } from "svelte";
import GeneralSettings from "../lib/pages/options/GeneralSettings.svelte";
import ManageData from "../lib/pages/options/ManageData.svelte";
import IgnoreList from "../lib/pages/options/IgnoreList.svelte";
import ManageSites from "../lib/pages/options/ManageSites.svelte";
import About from "../lib/pages/options/About.svelte";
import Search from "../lib/pages/search/Search.svelte";

export function pagesToRoutes(
  pages: PageNavigation[]
): Record<string, Component> {
  const routes: Record<string, Component> = {};
  for (const page of pages) {
    routes[page.route] = page.component;
  }
  return routes;
}

// Define pages available for navigation
export enum Page {
  // Non-menu pages
  SEARCH = "/search",
  DEBUG = "/debug",

  // Menu pages
  ADD = "/add",
  GENERATE_PASSWORD = "/pwgen",
  SESSIONS = "/sessions",
  OPTIONS = "/options",

  // Options child pages
  GENERAL_SETTINGS = "/options/general",
  MANAGE_DATA = "/options/data",
  IGNORE_LIST = "/options/ignore",
  SITES = "/options/sites",
  ABOUT = "/options/about",
}

export interface PageNavigation {
  title: string;
  subtitle?: string;
  icon: string;
  route: Page;
  component: Component<any>;
  children?: PageNavigation[];
}

type RootPage = "search" | "sessions" | "add" | "pwgen" | "options";
export const pages: Record<RootPage, PageNavigation> = {
  // Non-menu pages
  search: {
    title: "Search",
    icon: searchIcon,
    route: Page.SEARCH,
    component: Search,
  },
  // Menu pages
  sessions: {
    title: getMessage(LocalizedMessage.MENU_SESSIONS),
    icon: vaultOpenIcon,
    route: Page.SESSIONS,
    component: Sessions,
  },
  add: {
    title: getMessage(LocalizedMessage.MENU_ADD),
    icon: addIcon,
    route: Page.ADD,
    component: Add,
  },
  pwgen: {
    title: getMessage(LocalizedMessage.MENU_GENERATE_PASSWORD),
    icon: pwgenIcon,
    route: Page.GENERATE_PASSWORD,
    component: PasswordGenerator,
  },
  options: {
    title: getMessage(LocalizedMessage.MENU_OPTIONS),
    icon: optionsIcon,
    route: Page.OPTIONS,
    component: Options,
    children: [
      {
        component: GeneralSettings,
        route: Page.GENERAL_SETTINGS,
        title: getMessage(LocalizedMessage.OPTIONS_GENERAL_TITLE),
        subtitle: getMessage(LocalizedMessage.OPTIONS_GENERAL_SUBTITLE),
        icon: optionsIcon,
      },
      {
        component: ManageData,
        route: Page.MANAGE_DATA,
        title: getMessage(LocalizedMessage.OPTIONS_SITES_TITLE),
        subtitle: getMessage(LocalizedMessage.OPTIONS_SITES_SUBTITLE),
        icon: storedSafeIcon,
      },
      {
        component: IgnoreList,
        route: Page.IGNORE_LIST,
        title: getMessage(LocalizedMessage.OPTIONS_IGNORE_TITLE),
        subtitle: getMessage(LocalizedMessage.OPTIONS_IGNORE_SUBTITLE),
        icon: warningIcon,
      },
      {
        component: ManageSites,
        route: Page.MANAGE_DATA,
        title: getMessage(LocalizedMessage.OPTIONS_DATA_TITLE),
        subtitle: getMessage(LocalizedMessage.OPTIONS_DATA_SUBTITLE),
        icon: errorIcon,
      },
      {
        component: About,
        route: Page.ABOUT,
        title: getMessage(LocalizedMessage.OPTIONS_ABOUT_TITLE),
        subtitle: getMessage(LocalizedMessage.OPTIONS_ABOUT_SUBTITLE),
        icon: infoIcon,
      },
    ],
  },
};

// Main menu to be shown when online
export const mainMenu: PageNavigation[] = [
  pages.sessions,
  pages.add,
  pages.pwgen,
  pages.options,
];
// Main menu to be shown when offline
export const offlineMenu: PageNavigation[] = [pages.sessions, pages.options];
// Pages that should be navigable, but not show up in menus
export const nonMenuPages: PageNavigation[] = [pages.search];
