<script lang="ts">
  import { getMessage, LocalizedMessage } from "../../../../../global/i18n";
  import { sessions } from "../../../../stores";

  export let host: string;
</script>

<label>
  <span>{getMessage(LocalizedMessage.ADD_HOST)}</span>
  <select bind:value={host}>
    {#each [...$sessions.keys()] as host (host)}
      <option value={host}>{host}</option>
    {/each}
  </select>
</label>
