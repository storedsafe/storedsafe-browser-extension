<script lang="ts">
  import { afterUpdate } from "svelte";
  import { getMessage, LocalizedMessage } from "../../../../../global/i18n";
  import { preferences, structure } from "../../../../stores";

  let oldHost: string = null;
  export let host: string;
  export let groupid: string;

  let vaults: StoredSafeVault[];

  function getDefaultVault(): string {
    if (!vaults) return undefined;
    const preferredVault = $preferences.add?.hosts?.[host];
    if (vaults.findIndex(({ id }) => id === preferredVault) !== -1) {
      return preferredVault;
    }
    return vaults[0]?.id;
  }

  structure.subscribe((newStructure) => {
    let hostStructure = newStructure.get(host);
    vaults = hostStructure?.vaults;
    groupid = getDefaultVault();
  });

  afterUpdate(() => {
    if (oldHost !== host) {
      oldHost = host;
      let hostStructure = $structure.get(host);
      vaults = hostStructure?.vaults;
      groupid = getDefaultVault();
    }
  });
</script>

{#if !!host && !!vaults}
  <label for="vault">
    <span>{getMessage(LocalizedMessage.ADD_VAULT)}</span>
    <select id="vault" bind:value={groupid}>
      {#each vaults as vault (vault.id)}
        <option value={vault.id}>{vault.name}</option>
      {/each}
    </select>
  </label>
{/if}
