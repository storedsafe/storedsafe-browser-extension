<script lang="ts">
  import { sendMessage } from "../../../global/messages";

  import Fill from "./Fill.svelte";
  import Save from "./Save.svelte";

  export let page: string;

  function resize(e: CustomEvent<{ height: string; width: string }>) {
    const { height, width } = e.detail;
    // sendMessage({
    //   context: "iframe",
    //   action: "resize",
    //   data: {
    //     id: page,
    //     height: `${height + 20}px`,
    //     width: `${width + 20}px`,
    //   },
    // });
  }

  function close(e: CustomEvent<browser.runtime.Port>) {
    const port = e.detail;
    // sendMessage(
    //   {
    //     context: "iframe",
    //     action: "close",
    //     data: {
    //       id: page,
    //     },
    //   },
    //   port
    // );
  }
</script>

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

<div class="iframe">
  <section class="container">
    {#if page === 'save'}
      <Save onResize={resize} onClose={close} />
    {:else if page === 'fill'}
      <Fill on:resize={resize} on:close={close} />
    {/if}
  </section>
</div>
