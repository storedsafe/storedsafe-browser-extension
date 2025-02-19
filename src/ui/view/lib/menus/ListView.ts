import type { Component } from "svelte";

export interface ListItem<T extends Record<string, any>> {
  component: Component<T, any, any>;
  name: any;
  props: T;
}
