import type { Component } from "svelte";

type RouteParams = Record<string, string>;

class Router {
  _route: string = $state("/");
  routes: Record<string, Component> = {};
  component: Component | null = $state(null);
  props: RouteParams = $state({});

  constructor() {
    this.goto(window.location.hash.replace("#", ""));
  }

  addRoute(route: string, component: Component<any>) {
    this.routes[route] = component;
    this.updateComponentAndProps();
  }

  goto(route: string): void {
    this.route = route;
  }

  public get route() {
    return this._route;
  }

  private set route(route: string) {
    this._route = route;
    this.updateComponentAndProps();
  }

  private updateComponentAndProps() {
    const [component, props] = this.getComponentAndProps() ?? [null, {}];
    this.component = component;
    this.props = props;
  }

  private getComponentAndProps(): [Component, RouteParams] | null {
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
