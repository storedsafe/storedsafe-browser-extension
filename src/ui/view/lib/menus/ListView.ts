import type { SvelteComponent } from "svelte";

export interface ListItem<T> {
  component: typeof SvelteComponent
  name: any
  props: T
}