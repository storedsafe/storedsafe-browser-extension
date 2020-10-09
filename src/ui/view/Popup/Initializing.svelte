<script lang="ts">
  import { slide } from "svelte/transition";
  import Logo from '../lib/layout/Logo.svelte'
  import LoadingBar from "../lib/layout/LoadingBar.svelte";
</script>

<style>
  section {
    padding: var(--spacing);
  }
</style>

<section transition:slide class="grid">
  <Logo />
  <LoadingBar isLoading={true} />
</section>
