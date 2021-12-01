<script type="ts">
  export let showing: boolean = false;
  export let enabled: boolean = true;
</script>

<section>
  <button
    disabled={!enabled}
    type="button"
    on:click={() => (showing = !showing)}
  >
    <slot name="title" />
    {#if enabled}
      <b>
        {#if showing}-{:else}+{/if}
      </b>
    {/if}
  </button>
  <div class="content" class:hidden={!showing}>
    <slot name="content" />
  </div>
</section>

<style>
  .content {
    padding: var(--spacing);
  }
  .content.hidden {
    display: none;
  }

  button {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    color: var(--color-primary-dark);
  }

  button:disabled {
    background-color: var(--color-bg) !important;
  }

  button:not(:disabled) {
    background-color: var(--color-input-bg);
  }

  button:not(:disabled):hover,
  button:not(:disabled):focus,
  button:not(:disabled):active {
    background-color: var(--color-input-bg-light);
    color: var(--color-primary-dark);
  }
</style>
