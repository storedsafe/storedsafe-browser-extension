<script lang="ts" module>
  import { Logger } from "@/global/logger";
  const logger = new Logger("select-vault");

  export interface Props {
    host: string;
    vaultid: string;
  }
</script>

<script lang="ts">
  import { getMessage, LocalizedMessage } from "@/global/i18n";
  import { preferences, instances } from "@/ui/stores";

  let { host, vaultid = $bindable() }: Props = $props();

  let vaults: StoredSafeVault[] = $derived(
    instances.instances.get(host)?.vaults ?? []
  );

  $effect(() => {
    // Reselect the vault when the vault list changes.
    // Depends on the `vaults` derived store.
    vaultid = getDefaultVault();
  });

  /**
   * Gets the preferred vault if it exists, otherwise the first available vault.
   */
  function getDefaultVault(): string {
    if (!vaults) return "";
    const preferredVault = preferences.data.add?.vaults?.[host];
    if (preferredVault) {
      const vaultIndex = vaults.findIndex(({ id }) => id === preferredVault);
      if (vaultIndex !== -1) return preferredVault;
    }
    return vaults[0]?.id ?? "";
  }

  /**
   * Updates the preferred vault so it is automatically selected in the future.
   */
  function updatePreferences() {
    preferences.setVaultPreferences(host, vaultid).catch(logger.error);
  }

  if (!vaultid) vaultid = getDefaultVault();
</script>

{#if !!host && !!vaults}
  <label for="vault">
    <span>{getMessage(LocalizedMessage.ADD_VAULT)}</span>
    <select
      id="vault"
      bind:value={vaultid}
      onchange={() => updatePreferences()}
    >
      {#each vaults as vault (vault.id)}
        {#if vault.permissions >= 2}
          <option value={vault.id}>{vault.name}</option>
        {/if}
      {/each}
    </select>
  </label>
{/if}
