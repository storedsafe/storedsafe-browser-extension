<script lang="ts">
  import IFrame from "./view/iframe/IFrame.svelte";
  import Popup from "./view/Popup/Popup.svelte";

  let page = $derived(window.location.hash.replace("#", ""))
</script>

<main>
  {#if page !== ''}
    <IFrame {page} />
  {:else}
    <Popup />
  {/if}
</main>
