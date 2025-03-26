<script lang="ts" module>
  export interface Props {
    items: Record<string, any>;
    component: Snippet<[string, any]>;
  }
</script>

<script lang="ts">
  // type: ignore
  import RecursiveList from "./RecursiveList.svelte";
  import type { Snippet } from "svelte";

  let { items, component }: Props = $props();
</script>

<section class="grid">
  {#each Object.keys(items) as key}
    {@const item = items[key]}
    {@render component(key, item)}

    {#if item.children}
      <div class="indent">
        <RecursiveList items={item.children} {component}></RecursiveList>
      </div>
    {/if}
  {/each}
</section>
