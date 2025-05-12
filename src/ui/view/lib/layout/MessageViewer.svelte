<script lang="ts" module>
  interface Props {
    messages: Messages;
    shownMessages?: number;
  }
</script>

<script lang="ts">
  import { Messages } from "@/ui/stores";
  import { getMessage, LocalizedMessage } from "@/global/i18n";
  import MessageBox from "./MessageBox.svelte";

  let { messages, shownMessages = 2 }: Props = $props();
  let latestMessages = $derived.by(() => {
    if (shownMessages > messages.count) {
      return messages.messages.reverse();
    }
    return messages.messages
      .slice(messages.count - shownMessages, messages.count)
      .reverse();
  });
</script>

{#if messages.count > 0}
  <article class="grid messages">
    {#each latestMessages as { message, messageType, id } (id)}
      <MessageBox on:close={messages.remove} {messageType} {id}
        >{message}</MessageBox
      >
    {/each}
    {#if messages.count > shownMessages}
      <span class="more-messages subtitle">
        <span>
          {messages.count - shownMessages === 1
            ? getMessage(LocalizedMessage.MESSAGES_ONE_MORE)
            : getMessage(
                LocalizedMessage.MESSAGES_MORE,
                messages.count - shownMessages
              )}
        </span>
        <button
          type="button"
          onclick={() => messages.clear()}
          class="input-reset clear"
        >
          {getMessage(LocalizedMessage.MESSAGES_CLEAR)}
        </button>
      </span>
    {/if}
  </article>
{/if}

<style>
  .more-messages {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    background-color: var(--color-primary);
    color: var(--color-fg-light);
    border-radius: var(--border-radius);
    padding: var(--spacing);
    user-select: none;
  }

  .more-messages span {
    text-align: center;
  }

  button.clear {
    background: transparent;
    height: 100%;
    padding: 0;
    border-bottom: 2px solid var(--color-danger);
  }
</style>
