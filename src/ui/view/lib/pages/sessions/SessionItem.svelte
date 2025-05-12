<script lang="ts" module>
  export interface Props {
    selected?: boolean;
    host: string;
    isOnline: boolean;
    hasWarnings: boolean;
    hasViolations: boolean;
  }
</script>

<script lang="ts">
  import { getMessage, LocalizedMessage } from "@/global/i18n";
  import { errorIcon, warningIcon } from "@/global/icons";
  import Icon from "@/ui/view/lib/layout/Icon.svelte";

  let {
    selected = false,
    host,
    isOnline,
    hasWarnings,
    hasViolations,
  }: Props = $props();
</script>

<section class:selected>
  <article class="text">
    <span class="title" title={host}>{host}</span>
    {#if isOnline}
      <span class="subtitle online">
        {getMessage(LocalizedMessage.SESSIONS_ONLINE)}
      </span>
    {:else}
      <span class="subtitle offline">
        {getMessage(LocalizedMessage.SESSIONS_OFFLINE)}
      </span>
    {/if}
  </article>
  <article class="icons">
    {#if hasWarnings}
      <div
        class="icon"
        title={getMessage(LocalizedMessage.SESSIONS_WARNINGS_ICON_TITLE)}
      >
        <Icon d={warningIcon} color="var(--color-warning)" />
      </div>
    {/if}
    {#if hasViolations}
      <div
        class="icon"
        title={getMessage(LocalizedMessage.SESSIONS_VIOLATIONS_ICON_TITLE)}
      >
        <Icon d={errorIcon} color="var(--color-danger)" />
      </div>
    {/if}
  </article>
</section>

<style>
  section {
    display: grid;
    grid-template-columns: 1fr auto;
    column-gap: var(--spacing);
    width: 100%;
  }

  .text {
    display: grid;
  }

  .icons {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .icon {
    display: flex;
    align-items: center;
  }

  .icon + .icon {
    margin-left: calc(0.5 * var(--spacing));
  }

  span {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .online {
    color: var(--color-accent);
  }

  .offline {
    color: var(--color-danger);
  }
</style>
