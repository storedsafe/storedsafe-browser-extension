<script lang="ts">
  export let items: Record<string, any>;
</script>

<section class="grid">
  {#each Object.keys(items) as key}
    <slot {key} item={items[key]} />
    {#if items[key].children}
      <div class="indent">
        <svelte:self
          items={items[key].children}
          let:key={subkey}
          let:item={subitem}
        >
          <slot key={subkey} item={subitem} />
        </svelte:self>
      </div>
    {/if}
  {/each}
</section>
