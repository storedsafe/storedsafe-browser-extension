<script lang="ts">
  import type { Message, MessageStore } from "../../../stores";
  import { getMessage, LocalizedMessage } from "../../../../global/i18n";

  import MessageBox from "./MessageBox.svelte";

  const NUM_MESSAGES = 2;

  export let messages: MessageStore;

  /**
   * Get the last `amount` messages.
   * */
  $: getLatestMessages = function (amount: number) {
    if (amount > $messages.length) {
      return $messages.reverse();
    }
    return $messages
      .slice($messages.length - amount, $messages.length)
      .reverse();
  };
</script>

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

{#if $messages.length > 0}
  <article class="grid messages">
    {#each getLatestMessages(2) as { message, messageType, id } (id)}
      <MessageBox on:close={messages.remove} {messageType} {id}>{message}</MessageBox>
    {/each}
    {#if $messages.length > NUM_MESSAGES}
      <span class="more-messages subtitle">
        <span>
          {$messages.length - NUM_MESSAGES === 1 ? getMessage(LocalizedMessage.MESSAGES_ONE_MORE) : getMessage(LocalizedMessage.MESSAGES_MORE, $messages.length - NUM_MESSAGES)}
        </span>
        <button
          type="button"
          on:click={messages.clear}
          class="input-reset clear">
          {getMessage(LocalizedMessage.MESSAGES_CLEAR)}
        </button>
      </span>
    {/if}
  </article>
{/if}
