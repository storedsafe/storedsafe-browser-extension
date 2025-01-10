<script lang="ts">
  import { vaultIcon } from "../../../../../global/icons";

  import Icon from "../../layout/Icon.svelte";

  export let vault: StoredSafeVault;
  export let centered: boolean;
</script>

<style>
  .vault-info {
    user-select: none;
    display: grid;
    grid-auto-flow: column;
    column-gap: var(--spacing);
    justify-content: start;
    align-items: center;
  }

  .vault-info.centered {
    justify-content: center;
  }

  .vault-name {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .permission {
    text-shadow: 1px 1px 1px var(--color-primary-light);
    color: var(--color-fg-light);
  }

  .permission.granted {
    text-shadow: none;
    color: var(--color-accent);
    font-weight: bold;
  }
</style>

{#if !!vault}
  <span class="subtitle vault-info" class:centered>
    <Icon d={vaultIcon} size="0.8em" color="var(--color-primary-dark)" />
    <span title={vault.name} class="vault-name">{vault.name}</span>
    <span
      title="Read"
      class="permission"
      class:granted={vault.permissions >= 0}>R</span>
    <span
      title="Write"
      class="permission"
      class:granted={vault.permissions >= 2}>W</span>
    <span
      title="Admin"
      class="permission"
      class:granted={vault.permissions >= 4}>A</span>
  </span>
{/if}
