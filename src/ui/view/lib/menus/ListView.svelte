<script lang="ts" module>
  export interface Props {
    items: ListItem<any>[];
    selected?: any;
    onSelect?: (name: string | null) => void;
  }
</script>

<script lang="ts">
  import type { ListItem } from "./ListView";
  import ListItemBox from "./ListItemBox.svelte";

  let { items = [], selected = null, onSelect }: Props = $props();

  function setSelected(name: any) {
    if (name === selected) {
      onSelect?.(null);
    } else {
      onSelect?.(name);
    }
  }
</script>

<section class:selected={!!selected} class="grid">
  {#each items as { component, props, name } (name)}
    {#if !selected || selected === name}
      <ListItemBox
        onClick={() => setSelected(name)}
        selected={selected === name}
      >
        <component selected={selected === name} {...props}></component>
      </ListItemBox>
    {/if}
  {/each}
</section>

<style>
  section.selected {
    row-gap: 0;
  }
</style>
