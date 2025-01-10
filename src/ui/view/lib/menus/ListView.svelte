<script lang="ts">
  import type { ListItem } from './ListView'
  import { createEventDispatcher } from "svelte";
  import ListItemBox from "./ListItemBox.svelte";

  const dispatch = createEventDispatcher();

  export let items: ListItem<any>[] = [];
  export let selected: any = null;

  function setSelected(name: any) {
    dispatch("select", selected !== name ? name : null);
  }
</script>

<style>
  section.selected {
    row-gap: 0;
  }
</style>

<section class:selected={!!selected} class="grid">
  {#each items as { component, props, name } (name)}
    {#if !selected || selected === name}
      <ListItemBox on:click={() => setSelected(name)} selected={selected === name}>
        <svelte:component this={component} selected={selected === name} {...props} />
      </ListItemBox>
    {/if}
  {/each}
</section>
