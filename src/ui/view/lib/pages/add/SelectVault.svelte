<script lang="ts" context="module">
  import { Logger } from "../../../../../global/logger";
  const logger = new Logger("select-vault");
</script>

<script lang="ts">
  import { afterUpdate } from "svelte";
  import { getMessage, LocalizedMessage } from "../../../../../global/i18n";
  import { preferences, structure } from "../../../../stores";

  let oldHost: string = null;
  export let host: string;
  export let vaultid: string;

  let vaults: StoredSafeVault[];

  function getDefaultVault(): string {
    if (!vaults) return undefined;
    const preferredVault = $preferences.add?.vaults?.[host];
    if (vaults.findIndex(({ id }) => id === preferredVault) !== -1) {
      return preferredVault;
    }
    return vaults[0]?.id;
  }

  structure.subscribe((newStructure) => {
    let hostStructure = newStructure.get(host);
    vaults = hostStructure?.vaults;
    vaultid = getDefaultVault();
  });

  afterUpdate(() => {
    if (oldHost !== host) {
      oldHost = host;
      let hostStructure = $structure.get(host);
      vaults = hostStructure?.vaults;
      vaultid = getDefaultVault();
    }
  });

  function updatePreferences() {
    preferences.setVaultPreferences(host, vaultid).catch(logger.error);
  }
</script>

{#if !!host && !!vaults}
  <label for="vault">
    <span>{getMessage(LocalizedMessage.ADD_VAULT)}</span>
    <select id="vault" bind:value={vaultid} on:change={updatePreferences}>
      {#each vaults as vault (vault.id)}
        {#if vault.permissions >= 2}
          <option value={vault.id}>{vault.name}</option>
        {/if}
      {/each}
    </select>
  </label>
{/if}
