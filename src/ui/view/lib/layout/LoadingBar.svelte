<script lang="ts">
  import { slide } from "svelte/transition";

  import { getMessage, LocalizedMessage } from "../../../../global/i18n";

  export let isLoading: boolean = false;
</script>

<style>
  div {
    border-radius: var(--spacing);
    background: repeating-linear-gradient(
      90deg,
      var(--color-accent-dark),
      var(--color-accent),
      var(--color-accent-light) 50%
    );
    background-size: 200% 100%;
    animation: loading 1.1s cubic-bezier(0.8, 0, 0.4, 0.8) infinite reverse;
    height: var(--spacing);
  }

  @keyframes loading {
    0% {
      background-position-x: 0%;
    }
    100% {
      background-position-x: 100%;
    }
  }
</style>

{#if isLoading}
  <div
    aria-label={getMessage(LocalizedMessage.LOADING_TITLE)}
    title={getMessage(LocalizedMessage.LOADING_TITLE)}
    class="shadow" />
{/if}
