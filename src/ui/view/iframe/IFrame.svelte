<script lang="ts">
  import Save from "./Save.svelte";

  export let page: string;
</script>

<style>
  .iframe {
    width: 100vw;
    height: 100vh;
    padding: var(--spacing);
    box-sizing: border-box;
  }

  .container {
    background: var(--color-primary);
    border-radius: var(--border-radius);
    width: 100%;
    height: 100%;
    padding: var(--spacing);
    box-sizing: border-box;
    box-shadow: 0 2px 4px 2px rgba(0, 0, 0, 0.3);
  }
</style>

<div class="iframe">
  <section class="container">
  {#if page === 'save'}
    <Save />
  {/if}
  </section>
</div>
