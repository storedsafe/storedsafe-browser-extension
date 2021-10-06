<script lang="ts" context="module">
  import { Logger } from "../../../../../global/logger";
  const logger = new Logger("select-host");
</script>

<script lang="ts">
  import { getMessage, LocalizedMessage } from "../../../../../global/i18n";
  import { preferences, sessions } from "../../../../stores";

  function getDefaultHost(): string {
    const preferredHost = $preferences.add?.host;
    const hosts: string[] = [...$sessions.keys()];
    if (preferredHost === undefined || !hosts.find((host) => host === preferredHost)) {
      return $sessions.keys()[0];
    }
    return preferredHost;
  }

  export let host: string = getDefaultHost();

  function updatePreferences() {
    preferences.setHostPreferences(host).catch(logger.error);
  }
</script>

<label>
  <span>{getMessage(LocalizedMessage.ADD_HOST)}</span>
  <select bind:value={host} on:change={updatePreferences}>
    {#each [...$sessions.keys()] as host (host)}
      <option value={host}>{host}</option>
    {/each}
  </select>
</label>
