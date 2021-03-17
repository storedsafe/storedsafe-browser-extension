<script lang="ts" context="module">
  import { Logger } from "../../../global/logger";
  const logger = new Logger("save");
</script>

<script lang="ts">
  import { afterUpdate, createEventDispatcher, onMount } from "svelte";

  import { vault } from "../../../global/api";
  import { getMessage, LocalizedMessage } from "../../../global/i18n";
  import type { Message } from "../../../global/messages";
  import {
    ignore,
    preferences,
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
  import SelectHost from "../lib/pages/add/SelectHost.svelte";
  import SelectVault from "../lib/pages/add/SelectVault.svelte";
  import SelectTemplate from "../lib/pages/add/SelectTemplate.svelte";
  import TemplateFields from "../lib/pages/add/TemplateFields.svelte";
  import Initializing from "../Popup/Initializing.svelte";
  import QuickSave from "./QuickSave.svelte";
  import Logo from "../lib/layout/Logo.svelte";

  const dispatch = createEventDispatcher();
  let data: Record<string, string> = {
    parentid: "0",
    templateid: "20",
    name: "Foo",
    username: "foobar",
    url: "foo.bar",
  };
  let edit: boolean = false;
  let success: boolean = false;
  let host: string;

  let frame: HTMLElement;
  let height: number;

  let port: browser.runtime.Port;

  $: isInitialized =
    $preferences !== null &&
    $sites !== null &&
    $sessions !== null &&
    $structure !== null;

  function close() {
    dispatch("close", port);
  }

  function resize(height: number, width: number = 300) {
    dispatch("resize", {
      height,
      width,
    });
  }

  afterUpdate(() => {
    if (!!frame && height !== frame.clientHeight) {
      height = frame?.clientHeight;
      resize(height);
    }
  });

  onMount(() => {
    port = browser.runtime.connect({ name: "save" });
    port.onMessage.addListener((message: Message) => {
      logger.debug('Message Received: %o', message)
      if (message.context === "save" && message.action === "populate") {
        data = { ...data, ...message.data };
      }
    });

    // Ensure iframe gets resized (afterUpdate unreliable)
    for (let delay = 200; delay <= 1000; delay += 200) {
      setTimeout(() => {
        height = frame?.clientHeight
        resize(height)
      }, delay)
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
          success = true;
          messages.add(
            getMessage(LocalizedMessage.ADD_SUCCESS),
            MessageType.INFO
          );
          preferences
            .setAddPreferences(host, data.groupid)
            .catch(logger.error);
          window.setTimeout(close, 1000);
        },
      }
    );
  }

  function addToIgnore() {
    loading.add(`Save.ignore`, ignore.add(data.url), {
      onError(error) {
        messages.add(error.message, MessageType.ERROR);
      },
      onSuccess() {
        close();
      },
    });
  }
</script>

<article class="save grid" bind:this={frame}>
  <Logo />
  <MessageViewer {messages} />
  <LoadingBar isLoading={$loading.isLoading} />
  {#if !success}
    {#if !isInitialized}
      <!-- Still loading -->
      <Initializing />
    {:else}
      <Card>
        {#if !edit}
          <!-- Quick save -->
          <QuickSave bind:host bind:data />
        {:else}
          <!-- Full add editor -->
          <SelectHost bind:host />
          {#if host !== undefined}
            <SelectVault {host} bind:groupid={data.groupid} />
            <SelectTemplate {host} bind:templateid={data.templateid} />
            {#if data.groupid !== undefined && data.templateid !== undefined}
              <TemplateFields
                {host}
                bind:groupid={data.groupid}
                bind:templateid={data.templateid}
                bind:values={data}
              />
            {/if}
          {/if}
        {/if}
      </Card>
    {/if}
    <div class="sticky-buttons">
      <div class="inline-buttons">
        <button
          on:click={save}
        >{getMessage(LocalizedMessage.ADD_CREATE)}</button>
        {#if !edit}
          <button
            class="warning"
            on:click={toggleEdit}
          >{getMessage(LocalizedMessage.SEARCH_RESULT_EDIT)}</button>
        {/if}
      </div>
      <button
        type="button"
        class="danger"
        on:click={close}
      >{getMessage(LocalizedMessage.IFRAME_CLOSE)}</button>
      {#if !edit}
        <button
          type="button"
          class="danger ignore"
          on:click={addToIgnore}
        >{getMessage(LocalizedMessage.SAVE_IGNORE)}</button>
      {/if}
    </div>
  {/if}
</article>

<style>
  .save {
    width: 300px;
    max-height: 400px;
    overflow: auto auto;
  }
  .ignore {
    padding: 0;
    border-radius: 0;
    background: transparent !important;
    box-shadow: none !important;
    color: var(--color-danger-light);
    justify-self: center;
  }

  .ignore:not(:disabled):hover,
  .ignore:not(:disabled):focus {
    border-bottom-color: var(--color-danger-light);
  }

  .inline-buttons {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    column-gap: var(--spacing);
  }
</style>
