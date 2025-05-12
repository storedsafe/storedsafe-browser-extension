<script lang="ts" module>
  import type { Snippet } from "svelte";

  export interface Props {
    show: boolean;
    children?: Snippet;
  }
</script>

<script lang="ts">
  let { show, children }: Props = $props();
</script>

{#if !show}
  <span class="hidden">********</span>
{:else}
  {@render children?.()}
{/if}

<style>
  .hidden {
    color: var(--color-danger);
  }
</style>
