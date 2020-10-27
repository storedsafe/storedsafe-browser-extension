<script lang="ts">
  import { afterUpdate, createEventDispatcher } from "svelte";
  import type { Message } from "../../../global/messages";
  import { sites, sessions, structure, loading } from "../../stores";

  import Add, { addRequirements } from "../lib/pages/add/Add.svelte";
  import Login from "../lib/pages/sessions/Login.svelte";
  import Welcome from "../lib/pages/welcome/Welcome.svelte";
  import Initializing from "../Popup/Initializing.svelte";

  const dispatch = createEventDispatcher();
  let siteIndex: number = 0;
  let data: Record<string, string> = {};

  let frame: HTMLElement;
  let height: number;
  let width: number;

  $: isInitialized =
    $sites !== null && $sessions !== null && $structure !== null;

  function close() {
    dispatch("close");
  }

  function resize(height: number, width: number) {
    dispatch("resize", {
      height,
      width,
    });
  }

  afterUpdate(() => {
    if (
      !!frame &&
      (height !== frame.clientHeight || width !== frame.clientWidth)
    ) {
      height = frame?.clientHeight;
      width = frame?.clientWidth;
      resize(height, width);
    }
  });

  const port = browser.runtime.connect({ name: "save" });
  port.onMessage.addListener((message: Message) => {
    if (message.context === "save" && message.action === "populate") {
      data = message.data;
    }
  });
</script>

<style>
  .save {
    width: 300px;
    overflow: auto auto;
  }
</style>

{@debug siteIndex}

<article class="save grid" bind:this={frame}>
  <h2>Save</h2>
  {#if !isInitialized}
    <Initializing />
  {:else if $sites.length < 1}
    <Welcome />
  {:else if $sessions.size === 0}
    {#if $sites.length === 1}
      <h2>{siteIndex}</h2>
    {:else}
      <select bind:value={siteIndex}>
        {#each $sites as site, i (site.host)}
          <option value={i}>{site.host}</option>
        {/each}
      </select>
    {/if}
    <Login site={$sites[siteIndex]} />
  {:else if !$loading.has(...addRequirements)}
    <Add defaultValues={data} />
  {/if}
  <button class="danger" on:click={close}>Close</button>
</article>
