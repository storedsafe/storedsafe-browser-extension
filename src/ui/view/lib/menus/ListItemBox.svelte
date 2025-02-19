<script lang="ts" module>
  export interface Props {
    selected?: boolean;
    single?: boolean;
    onClick?: () => void;
    children?: Snippet;
  }
</script>

<script lang="ts">
  import { backIcon } from "@/global/icons";
  import Icon from "@/ui/view/lib/layout/Icon.svelte";
  import type { Snippet } from "svelte";

  const {
    selected = false,
    single = false,
    onClick,
    children,
  }: Props = $props();

  const backIconProps = {
    d: backIcon,
    size: "1em",
    color: "#333",
  };
</script>

<!--
  @component
  Button representing an item in a ListView component.
-->
<button type="button" class:single class:selected onclick={() => onClick?.()}>
  {#if !single && selected}
    <Icon {...backIconProps} />
  {/if}
  {@render children?.()}
</button>

<style>
  button {
    position: relative;
    align-items: center;
    justify-content: flex-start;
    background-color: var(--color-input-bg);
    color: var(--color-fg);
    transition:
      background-color 0.2s,
      border-bottom 0.2s;
    text-align: left;
    overflow: hidden;
  }

  button.selected {
    display: grid;
    grid-template-columns: auto 1fr;
    text-align: center;
  }

  button.single.selected {
    grid-template-columns: 1fr;
  }

  button:not(:disabled):hover,
  button:not(:disabled):focus {
    background-color: var(--color-input-bg-light);
    border-bottom-color: var(--color-accent);
  }
</style>
