<script lang="ts" module>
  export interface Props {
    id: number;
    messageType: MessageType;
    onClose: () => void;
    children?: Snippet;
  }
</script>

<script lang="ts">
  import type { MessageType } from "@/ui/stores";
  import { addIcon } from "@/global/icons";

  import Icon from "./Icon.svelte";
  import type { Snippet } from "svelte";

  let { id, messageType, onClose, children }: Props = $props();
</script>

<!--
  @component
  Notification box for presenting information that requires extra attention.
-->
<article class={`grid ${messageType}`}>
  {#if children}
    {@render children()}
  {:else}
    {messageType}
  {/if}
  <!-- Show type if there is no message -->
  <button type="button" onclick={() => onClose()} class="input-reset close">
    <Icon d={addIcon} size="0.8em" />
  </button>
</article>

<style>
  article {
    font-weight: bold;
    grid-template-columns: 1fr auto;
    padding: var(--spacing);
    color: var(--color-fg-light);
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
    border-radius: var(--border-radius);
    border-bottom-width: 2px;
    border-bottom-style: solid;
  }

  article.error {
    border-color: var(--color-danger-dark);
    background: radial-gradient(
        circle at 0,
        rgba(255, 255, 255, 0.15),
        rgba(0, 0, 0, 0.15)
      ),
      var(--color-danger);
  }

  article.warning {
    border-color: var(--color-warning-dark);
    background: radial-gradient(
        circle at 0,
        rgba(255, 255, 255, 0.15),
        rgba(0, 0, 0, 0.15)
      ),
      var(--color-warning);
  }

  article.info {
    border-color: var(--color-accent-dark);
    background: radial-gradient(
        circle at 0,
        rgba(255, 255, 255, 0.15),
        rgba(0, 0, 0, 0.15)
      ),
      var(--color-accent);
  }

  button.close {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    height: 100%;
    padding: 0;
    transform: rotate(45deg);
  }

  button.close:not(:disabled):active {
    background: transparent;
  }
</style>
