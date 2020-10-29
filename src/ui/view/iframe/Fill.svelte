<script lang="ts">
  import { afterUpdate, createEventDispatcher, onMount } from "svelte";

  import { getMessage, LocalizedMessage } from "../../../global/i18n";
  import type { Message } from "../../../global/messages";
  import {
    preferences,
    sessions,
    structure,
    loading,
    messages,
    MessageType,
    Duration,
  } from "../../stores";

  import LoadingBar from "../lib/layout/LoadingBar.svelte";
  import MessageViewer from "../lib/layout/MessageViewer.svelte";
  import Initializing from "../Popup/Initializing.svelte";
  import Logo from "../lib/layout/Logo.svelte";
  import ListView from "../lib/menus/ListView.svelte";
  import type { ListItem } from "../lib/menus/ListView";
  import FillPreview from "./FillPreview.svelte";
  import { vault } from "../../../global/api";

  const dispatch = createEventDispatcher();
  let url: string
  let results: StoredSafeObject[] = [];

  let frame: HTMLElement;
  let height: number;

  $: isInitialized =
    $preferences !== null && $sessions !== null && $structure !== null;

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

  onMount(() => {
    const port = browser.runtime.connect({ name: "fill" });
    port.onMessage.addListener((message: Message) => {
      if (message.context === "fill" && message.action === "populate") {
        results = message.data.results;
        url = message.data.url;
      }
    });
  });

  interface FillPreviewProps {
    icon: string;
    template: string;
    title: string;
    username: string;
    host: string;
    vault: StoredSafeVault;
    id: string;
  }

  let items: ListItem<FillPreviewProps>[];
  $: items = results.map((result, i) => ({
    component: FillPreview,
    name: i,
    props: {
      icon: result.icon,
      template: result.type,
      title: result.name,
      username: result.fields.find(({ name }) => name === "username").value,
      host: result.host,
      vault: $structure
        ?.get(result.host)
        ?.vaults?.find(({ id }) => id === result.vaultId),
      id: result.id,
    },
  }));

  function onSelect(event: CustomEvent<any>): void {
    const id = event.detail;
    loading.add(`Fill.fill`, fill(results[id]), {
      onError(error) {
        messages.add(error.message, MessageType.ERROR, Duration.LONG);
      },
      onSuccess() {
        close();
      },
    });
  }

  async function fill(result: StoredSafeObject): Promise<void> {
    await preferences.setAutoFillPreferences(url, {
      host: result.host,
      objectId: result.id
    })
    const values: Record<string, any> = {};
    for (let i = 0; i < result.fields.length; i++) {
      let field = result.fields[i];
      if (field.isEncrypted && !result.isDecrypted) {
        const { token } = $sessions.get(result.host);
        result = await vault.decryptObject(result.host, token, result);
        field = result.fields[i];
      }
      values[field.name] = field.value;
    }
    browser.runtime.sendMessage({
      context: "fill",
      action: "fill",
      data: values,
    });
  }
</script>

<style>
  .save {
    width: 300px;
    max-height: 400px;
    overflow: auto auto;
  }
</style>

<article class="save grid" bind:this={frame}>
  <Logo />
  <MessageViewer {messages} />
  <LoadingBar isLoading={$loading.isLoading} />
  {#if !isInitialized}
    <!-- Still loading -->
    <Initializing />
  {:else}
    <ListView {items} on:select={onSelect} />
  {/if}
  <div class="sticky-buttons">
    <button
      type="button"
      class="danger"
      on:click={close}>{getMessage(LocalizedMessage.IFRAME_CLOSE)}</button>
  </div>
</article>
