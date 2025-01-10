<script lang="ts">
  export let show: boolean;
</script>

<style>
  .hidden {
    color: var(--color-danger);
  }
</style>

{#if !show}
  <span class="hidden">********</span>
{:else}
  <slot />
{/if}
