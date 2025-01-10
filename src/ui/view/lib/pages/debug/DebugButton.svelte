<script lang="ts">
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  function openDebug() {
    dispatch('open-debug')
  }
</script>

<style>
  #debug-button {
    position: absolute;
    width: var(--spacing);
    height: var(--spacing);
    left: 0;
    top: 0;
  }
</style>

<div id="debug-button" on:dblclick={openDebug} />
