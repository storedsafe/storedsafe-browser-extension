<script lang="ts">
  import { createEventDispatcher, onDestroy } from "svelte";
  import { getMessage, LocalizedMessage } from "../../../../global/i18n";

  const dispatch = createEventDispatcher();
  const close = () => dispatch("close");
  const confirm = () => dispatch("confirm");

  let modal: HTMLElement;

  const handle_keydown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      close();
      return;
    }

    if (e.key === "Tab") {
      // trap focus
      const nodes = modal.querySelectorAll<HTMLElement>("*");
      const tabbable = Array.from(nodes).filter(
        (n) => n.tabIndex >= 0
      );

      let index = tabbable.indexOf(document.activeElement as HTMLElement);
      if (index === -1 && e.shiftKey) index = 0;

      index += tabbable.length + (e.shiftKey ? -1 : 1);
      index %= tabbable.length;

      tabbable[index].focus();
      e.preventDefault();
    }
  };

  const previously_focused: HTMLElement =
    typeof document !== "undefined" && (document.activeElement as HTMLElement);

  if (previously_focused) {
    onDestroy(() => {
      previously_focused.focus();
    });
  }
</script>

<style>
  .modal-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
  }

  .modal {
    position: absolute;
    left: 50%;
    top: 50%;
    width: calc(100vw - 4em);
    max-width: min(80%, 32em);
    max-height: calc(100vh - 4em);
    overflow: auto;
    transform: translate(-50%, -50%);
    padding: 1em;
    border-radius: 0.2em;
    background: var(--color-bg);
    color: var(--color-fg);
  }
</style>

<!--
  Modal code borrowed from https://svelte.dev/examples#modal
-->
<svelte:window on:keydown={handle_keydown} />

<div class="modal-background" on:click={close} />

<div class="modal grid" role="dialog" aria-modal="true" bind:this={modal}>
  <slot />
  <button
    type="button"
    class="danger"
    on:click={confirm}>{getMessage(LocalizedMessage.CONFIRM_DIALOG_YES)}</button>
  <!-- svelte-ignore a11y-autofocus -->
  <button
    type="button"
    class="primary"
    autofocus
    on:click={close}>{getMessage(LocalizedMessage.CONFIRM_DIALOG_NO)}</button>
</div>
