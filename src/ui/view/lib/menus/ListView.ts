import type { Component } from "svelte";

export interface ListItem<T extends Record<string, any>> {
  Component: Component<T, any, any>;
  name: any;
  props: T;
}
