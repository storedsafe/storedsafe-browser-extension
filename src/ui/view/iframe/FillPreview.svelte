<script lang="ts" module>
  export interface Props {
    selected?: boolean;
    icon: string;
    template: string;
    title: string;
    username?: string;
    host: string;
    vault: StoredSafeVault;
    id: string;
  }
</script>

<script lang="ts">
  import { storedSafeIcon } from "@/global/icons";
  import templateIcons from "@/global/template_icons";
  import Icon from "@/ui/view/lib/layout/Icon.svelte";
  import VaultInfo from "@/ui/view/lib/pages/search/VaultInfo.svelte";

  let {
    selected = false,
    icon,
    template,
    title,
    username,
    host,
    vault,
    id,
  }: Props = $props();
</script>

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
          color="var(--color-primary-dark)"
        />
        {host}
      </span>
    {/if}
  </article>
  <div class="icon" title={template}>
    {@html templateIcons[icon as keyof typeof templateIcons]}
  </div>
</section>

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
