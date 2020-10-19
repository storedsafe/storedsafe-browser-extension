<script lang="ts">
import { onMount } from "svelte";


  export let color: string = "var(--color-fg-light)";
  export let stroke: string = color;
  export let strokeWidth: number = 0;
  export let filled: boolean = true;
  export let fill: string = filled ? color : "none";
  export let size: string = "var(--button-icon-size)";
  export let viewBox: string = "0 0 32 32";
  export let isButton: boolean = false;

  export let innerHTML: string = null;
  export let d: string;

  let element: SVGElement;

  onMount(() => {
    if (!!innerHTML && !!element) {
      element.innerHTML = innerHTML
    }
  })
</script>

<style>
  svg {
    fill: var(--svg-fill);
    width: var(--svg-width);
    height: var(--svg-height);
  }
</style>

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
  {...$$restProps}>
  <slot>
    <path
      {d}
      {stroke}
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-linejoin="round" />
  </slot>
</svg>
