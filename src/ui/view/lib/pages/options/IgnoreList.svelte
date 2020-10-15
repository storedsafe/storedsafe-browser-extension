<script lang="ts">
  import { getMessage, LocalizedMessage } from "../../../../../global/i18n";
  import { Duration, loading, messages, MessageType } from "../../../../stores";
  import { ignore } from "../../../../stores/browserstorage";

  import Card from "../../layout/Card.svelte";

  function removeUrl(url: string) {
    loading.add(`IgnoreListe.remove.${url}`, ignore.remove(url), {
      onError(error) {
        messages.add(error.message, MessageType.ERROR, Duration.SHORT);
      },
      onSuccess() {
        messages.add(
          "Successfully removed URL from ignore list.",
          MessageType.INFO,
          Duration.SHORT
        );
      },
    });
  }
</script>

<style>
  .site-entry {
    background-color: var(--color-input-bg);
    border-radius: var(--border-radius);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .site-entry span {
    padding: var(--spacing);
  }
</style>

<Card>
  {#if $ignore.length === 0}
    {getMessage(LocalizedMessage.OPTIONS_IGNORE_EMPTY)}
  {/if}
  {#each $ignore as url (url)}
    <form class="site-entry" on:submit|preventDefault={() => removeUrl(url)}>
      <span>{url}</span>
      <button type="submit" class="danger">
        {getMessage(LocalizedMessage.OPTIONS_IGNORE_DELETE)}
      </button>
    </form>
  {/each}
</Card>
