<script lang="ts" module>
  import type { Snippet } from "svelte";

  export interface Props {
    /** Toggle dialog visibility */
    showModal: boolean;
    /** Choice to delete was confirmed */
    onConfirm?: () => void;
    /** Contents of dialog window */
    children?: Snippet;
  }
</script>

<script lang="ts">
  import { getMessage, LocalizedMessage } from "@/global/i18n";

  let { showModal = $bindable(), onConfirm, children }: Props = $props();

  let dialog: HTMLDialogElement | undefined = $state();

  $effect(() => {
    if (showModal) dialog?.showModal();
    else dialog?.close();
  });
</script>

<!--
  Modal code borrowed from https://svelte.dev/examples#modal
-->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
  bind:this={dialog}
  onclose={() => (showModal = false)}
  onclick={(e) => {
    if (e.target === dialog) dialog.close();
  }}
>
  <div class="grid">
    {@render children?.()}
    <button
      type="button"
      class="danger"
      onclick={() => {
        dialog?.close();
        onConfirm?.();
      }}
    >
      {getMessage(LocalizedMessage.CONFIRM_DIALOG_YES)}
    </button>
    <button type="button" class="primary" onclick={() => dialog?.close()}>
      {getMessage(LocalizedMessage.CONFIRM_DIALOG_NO)}
    </button>
  </div>
</dialog>

<style>
  dialog:open::backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
  }

  dialog {
    position: absolute;
    left: 50%;
    top: 50%;
    width: calc(100vw - 4em);
    max-width: min(80%, 32em);
    max-height: calc(100vh - 4em);
    overflow: auto;
    transform: translate(-50%, -50%);
    padding: var(--spacing);
    border-radius: var(--border-radius);
    background: var(--color-bg);
    color: var(--color-fg);
  }
</style>
