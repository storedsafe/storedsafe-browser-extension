<script lang="ts">
  import { storedSafeIcon } from "../../../../../global/icons";
  import templateIcons from "../../../../../global/template_icons";

  import Icon from "../../layout/Icon.svelte";
  import VaultInfo from "./VaultInfo.svelte";

  export let selected: boolean;

  export let icon: string;
  export let template: string;
  export let title: string;
  export let username: string = "";
  export let host: string = "";
  export let vault: StoredSafeVault;
  export let id: string;
</script>

<style>
  .search-item {
    display: grid;
    grid-template-columns: 1fr max-content auto;
    align-items: center;
    column-gap: var(--spacing);
    width: 100%;
  }

  .text {
    display: grid;
  }

  span {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .host {
    display: grid;
    grid-auto-flow: column;
    column-gap: var(--spacing);
    align-items: center;
    font-weight: bold;
    justify-content: start;
  }

  .selected .host {
    justify-content: center;
  }

  .icon :global(svg) {
    width: var(--button-icon-size);
    height: var(--button-icon-size);
  }
</style>

<section class:selected class="search-item">
  <article class="text">
    <span class="title" title={`${title} (${id})`}>{title}</span>
    {#if !!username}
      <span class="subtitle" title={username}>{username}</span>
    {/if}
    <VaultInfo centered={selected} {vault} />
    {#if !!host}
      <span class="subtitle host" title={host}>
        <Icon
          d={storedSafeIcon}
          size="0.9em"
          color="var(--color-primary-dark)" />
        {host}
      </span>
    {/if}
  </article>
  <div class="icon" title={template}>
    {@html templateIcons[icon]}
  </div>
</section>
