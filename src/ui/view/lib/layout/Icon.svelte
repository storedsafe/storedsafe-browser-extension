<script lang="ts" module>
  export interface Props extends HTMLAttributes<SVGElement> {
    color?: string;
    stroke?: string;
    strokeWidth?: number;
    filled?: boolean;
    fill?: string;
    size?: string;
    viewBox?: string;
    isButton?: boolean;
    innerHTML?: string;
    d: string;
    children?: Snippet;
  }
</script>

<script lang="ts">
  import { onMount, type Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  let {
    color = "var(--color-fg-light)",
    stroke = color,
    strokeWidth = 0,
    filled = true,
    fill = filled ? color : "none",
    size = "var(--button-icon-size)",
    viewBox = "0 0 32 32",
    isButton = false,
    innerHTML,
    d,
    children,
    ...restProps
  }: Props = $props();

  let element: SVGElement;

  onMount(() => {
    if (!!innerHTML && !!element) {
      element.innerHTML = innerHTML;
    }
  });
</script>

<svg
  bind:this={element}
  class:isButton
  class="icon"
  style={`
    --svg-fill: ${fill};
    --svg-width: ${size};
    --svg-height: ${size};
  `}
  {viewBox}
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  {...restProps}
>
  {#if children}
    {@render children()}
  {:else}
    <path
      {d}
      {stroke}
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  {/if}
</svg>

<style>
  svg {
    fill: var(--svg-fill);
    width: var(--svg-width);
    height: var(--svg-height);
  }
</style>
