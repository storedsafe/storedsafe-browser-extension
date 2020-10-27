<script lang="ts">
  import { afterUpdate, createEventDispatcher } from "svelte";
  import { vault } from "../../../global/api";

  import { getMessage, LocalizedMessage } from "../../../global/i18n";
  import type { Message } from "../../../global/messages";
  import { preferences } from "../../../global/storage";
  import {
    sites,
    sessions,
    structure,
    loading,
    messages,
    MessageType,
  } from "../../stores";

  import Card from "../lib/layout/Card.svelte";
  import LoadingBar from "../lib/layout/LoadingBar.svelte";
  import MessageViewer from "../lib/layout/MessageViewer.svelte";
  import Add, { addRequirements } from "../lib/pages/add/Add.svelte";
  import Login from "../lib/pages/sessions/Login.svelte";
  import Welcome from "../lib/pages/welcome/Welcome.svelte";
  import Initializing from "../Popup/Initializing.svelte";
  import QuickSave from "./QuickSave.svelte";

  const dispatch = createEventDispatcher();
  let siteIndex: number = 0;
  let data: Record<string, string> = {};
  let edit: boolean = false;
  let host: string;

  let frame: HTMLElement;
  let height: number;

  $: isInitialized =
    $preferences !== null &&
    $sites !== null &&
    $sessions !== null &&
    $structure !== null;

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
    if (!!frame && height !== frame.clientHeight) {
      height = frame?.clientHeight;
      resize(height, 300);
    }
  });

  const port = browser.runtime.connect({ name: "save" });
  port.onMessage.addListener((message: Message) => {
    if (message.context === "save" && message.action === "populate") {
      data = message.data;
      data.parentid = "0";
    }
  });

  const toggleEdit = () => {
    edit = !edit;
  };

  function save() {
    loading.add(
      `Save.add`,
      vault.addObject(host, $sessions.get(host).token, data),
      {
        onError(error) {
          messages.add(error.message, MessageType.ERROR);
        },
        onSuccess() {
          messages.add(
            getMessage(LocalizedMessage.ADD_SUCCESS),
            MessageType.INFO
          );
          preferences
            .setAddPreferences(host, data.groupid)
            .catch(console.error);
          setTimeout(close, 1000);
        },
      }
    );
  }
</script>

<style>
  .save {
    width: 300px;
    max-height: 400px;
    overflow: auto auto;
  }

  .inline-buttons {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    column-gap: var(--spacing);
  }
</style>

<article class="save grid" bind:this={frame}>
  <MessageViewer {messages} />
  <LoadingBar isLoading={$loading.isLoading} />
  <div>
    <p>Save to StoredSafe</p>
  </div>
  {#if !isInitialized}
    <!-- Still loading -->
    <Initializing />
  {:else if $sites.length < 1}
    <!-- No sites available -->
    <Welcome />
  {:else if $sessions.size === 0}
    <!-- Not logged in -->
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
    {#if !edit}
      <QuickSave bind:host bind:data />
    {:else}
      <!-- Full add editor -->
      <Add {host} defaultValues={data} />
    {/if}
  {/if}
  <div class="sticky-buttons">
    {#if !edit}
      <div class="inline-buttons">
        <button
          on:click={save}>{getMessage(LocalizedMessage.ADD_CREATE)}</button>
        <button
          class="warning"
          on:click={toggleEdit}>{getMessage(LocalizedMessage.SEARCH_RESULT_EDIT)}</button>
      </div>
    {/if}
    <button
      class="danger"
      on:click={close}>{getMessage(LocalizedMessage.IFRAME_CLOSE)}</button>
  </div>
</article>
