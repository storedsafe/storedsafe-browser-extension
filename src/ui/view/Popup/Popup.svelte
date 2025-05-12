<script lang="ts">
  import {
    ignoreURLs,
    preferences,
    sessions,
    settings,
    sites,
    instances,
    search,
  } from "@/ui/stores";
  import Main from "./Main.svelte";
  import Initializing from "./Initializing.svelte";

  let isInitialized = $derived(
    ignoreURLs.isInitialized &&
      preferences.isInitialized &&
      sessions.isInitialized &&
      settings.isInitialized &&
      sites.isInitialized &&
      instances.isInitialized &&
      search.isInitialized
  );
</script>

<section>
  {#if isInitialized}
    <Main />
  {:else}
    <Initializing />
  {/if}
</section>

<style>
  section {
    width: 360px;
    background: radial-gradient(
        circle at 0,
        rgba(255, 255, 255, 0.15),
        rgba(0, 0, 0, 0.15)
      ),
      var(--color-primary-dark);
    box-sizing: border-box;
  }
</style>
