<script lang="ts" module>
  export interface Props {
    page: string;
  }
</script>

<script lang="ts">
  import { Context, sendMessage } from "@/global/messages";

  import Fill from "./Fill.svelte";
  import Save from "./Save.svelte";
  import {
    ignoreURLs,
    preferences,
    sessions,
    settings,
    sites,
    instances,
  } from "@/ui/stores";

  let isInitialized = $derived(
    ignoreURLs.isInitialized &&
      preferences.isInitialized &&
      sessions.isInitialized &&
      settings.isInitialized &&
      sites.isInitialized &&
      instances.isInitialized
  );

  let { page }: Props = $props();

  function resize(height: number, width: number) {
    sendMessage({
      from: Context.IFRAME,
      to: Context.CONTENT_SCRIPT,
      action: "iframe.resize",
      data: {
        id: page,
        height: `${height + 20}px`,
        width: `${width + 20}px`,
      },
    });
  }

  function close() {
    sendMessage({
      from: Context.IFRAME,
      to: Context.CONTENT_SCRIPT,
      action: "iframe.close",
      data: {
        id: page,
      },
    });
  }
</script>

<div class="iframe">
  {#if isInitialized}
    <section class="container">
      {#if page === "save"}
        <Save onResize={resize} onClose={close} />
      {:else if page === "fill"}
        <Fill onResize={resize} onClose={close} />
      {/if}
    </section>
  {/if}
</div>

<style>
  .iframe,
  .container {
    height: min-content;
    width: min-content;
  }

  .iframe {
    padding: 5px;
    box-sizing: border-box;
    animation: zoom 0.8s cubic-bezier(0.8, 0, 0.4, 0.8);
  }

  .container {
    background: radial-gradient(
        circle at 0,
        rgba(255, 255, 255, 0.15),
        rgba(0, 0, 0, 0.15)
      ),
      var(--color-primary-dark);
    border-radius: var(--border-radius);
    padding: 5px;
    box-sizing: border-box;
    box-shadow: 0 2px 4px 2px rgba(0, 0, 0, 0.3);
    overflow: auto auto;
  }

  @keyframes zoom {
    0% {
      transform: scale(0);
      opacity: 0;
    }

    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
</style>
