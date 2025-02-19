<script lang="ts">
  import { ignoreURLs } from "@/ui/stores";
  import Popup from "@/ui/view/Popup/Popup.svelte";
</script>

{#each ignoreURLs.data as url}
  <p>{url}</p>
{/each}
<Popup />
