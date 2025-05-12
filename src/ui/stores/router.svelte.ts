import type { Component } from "svelte";
import { messages } from "./messages.svelte";
import { Logger } from "@/global/logger";

const logger = new Logger("router");

type RouteParams = Record<string, string>;

class Router {
  _route: string = $state("/");
  routes: Record<string, Component> = {};
  component: Component | null = $state(null);
  props: RouteParams = $state({});

  constructor() {
    this.addRoute = this.addRoute.bind(this);
    this.goto = this.goto.bind(this);
    this.gotoparent = this.gotoparent.bind(this);
    this.goto(window.location.hash.replace("#", ""));
  }

  setRoutes(routes: Record<string, Component>) {
    this.routes = routes;
    this.#updateComponentAndProps();
  }

  addRoute(route: string, component: Component<any>) {
    this.routes[route] = component;
    this.#updateComponentAndProps();
  }

  gotoparent(): void {
    this.goto("..");
  }

  goto(route: string): void {
    if (route === "..") {
      this.route = this.route.split("/").slice(0, -1).join("/") || "/";
    }
    this.route = route;
    logger.debug("goto: ", this.route);
  }

  public get route() {
    return this._route;
  }

  private set route(route: string) {
    if (route === this._route) return;
    this._route = route;
    messages.clear();
    this.#updateComponentAndProps();
  }

  #updateComponentAndProps() {
    const [component, props] = this.#getComponentAndProps() ?? [null, {}];
    this.component = component;
    this.props = props;
  }

  #getComponentAndProps(): [Component, RouteParams] | null {
    for (const route of Object.keys(this.routes)) {
      const routeRegex = route
        .replaceAll("/", "/")
        .replaceAll(/\[([^\]]*)\]/g, "(?<$1>[^/]*)");
      const routeMatcher = new RegExp(`^${routeRegex}$`);
      const matches = this.route.match(routeMatcher);
      if (matches) {
        if (matches.groups) {
          return [this.routes[route], matches.groups];
        }
        return [this.routes[route], {}];
      }
    }
    return null;
  }
}

export const router = new Router();
