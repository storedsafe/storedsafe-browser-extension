<script lang="ts" module>
  import { Logger } from "@/global/logger";
  const logger = new Logger("save");

  export interface Props {
    onResize: (height: number, width: number) => void;
    onClose: () => void;
  }
</script>

<script lang="ts">
  import { onMount } from "svelte";

  import { vault } from "@/global/api";
  import { getMessage, LocalizedMessage } from "@/global/i18n";
  import { isMessage, type Message } from "@/global/messages";
  import {
    sessions,
    loading,
    messages,
    MessageType,
    ignoreURLs,
  } from "@/ui/stores";

  import Card from "@/ui/view/lib/layout/Card.svelte";
  import LoadingBar from "@/ui/view/lib/layout/LoadingBar.svelte";
  import MessageViewer from "@/ui/view/lib/layout/MessageViewer.svelte";
  import SelectHost from "@/ui/view/lib/pages/add/SelectHost.svelte";
  import SelectVault from "@/ui/view/lib/pages/add/SelectVault.svelte";
  import SelectTemplate from "@/ui/view/lib/pages/add/SelectTemplate.svelte";
  import TemplateFields from "@/ui/view/lib/pages/add/TemplateFields.svelte";
  import QuickSave from "./QuickSave.svelte";
  import Logo from "@/ui/view/lib/layout/Logo.svelte";
  import { followFocus } from "@/ui/view/use/followFocus";

  let { onResize, onClose }: Props = $props();

  let data: Record<string, string> = $state({
    parentid: "0",
    templateid: "20",
    name: "",
    username: "",
    url: "",
  });
  let edit: boolean = $state(false);
  let success: boolean = $state(false);
  let isValid: boolean = $state(true);
  let host: string | undefined = $state();

  let frame: HTMLElement;
  let height: number;

  let port: browser.runtime.Port;

  function resize(height: number, width: number = 300) {
    onResize(height, width);
  }

  $effect(() => {
    if (!!frame && height !== frame.clientHeight) {
      height = frame?.clientHeight;
      resize(height);
    }
  });

  onMount(() => {
    port = browser.runtime.connect({ name: "save" });
    port.onMessage.addListener((message: object) => {
      if (isMessage(message)) {
        logger.debug("Message Received: %o", message);
        if (message.to === "save" && message.action === "populate") {
          data = { ...data, ...message.data };
        }
      }
    });

    // Ensure iframe gets resized (afterUpdate unreliable)
    for (let delay = 200; delay <= 1000; delay += 200) {
      setTimeout(() => {
        height = frame?.clientHeight;
        resize(height);
      }, delay);
    }
  });

  const toggleEdit = () => {
    edit = !edit;
  };

  function save(e: SubmitEvent) {
    e.preventDefault();
    const hostData = sessions.data.get(host ?? "");
    if (!host || !hostData) {
      messages.add("Host not set, invalid state.", MessageType.ERROR);
      return;
    }
    loading.add(`Save.add`, vault.addObject(host, hostData.token, data), {
      onError(error) {
        messages.add(error.message, MessageType.ERROR);
      },
      onSuccess() {
        success = true;
        messages.add(
          getMessage(LocalizedMessage.ADD_SUCCESS),
          MessageType.INFO
        );
        window.setTimeout(onClose, 1000);
      },
    });
  }

  function addToIgnore() {
    loading.add(`Save.ignore`, ignoreURLs.add(data.url), {
      onError(error) {
        messages.add(error.message, MessageType.ERROR);
      },
      onSuccess() {
        onClose();
      },
    });
  }
</script>

<article class="save grid" bind:this={frame}>
  <Logo />
  <MessageViewer {messages} />
  <LoadingBar isLoading={loading.isLoading} />
  {#if !success}
    <form class="grid" use:followFocus onsubmit={save}>
      <Card>
        {#if !edit}
          <!-- Quick save -->
          <QuickSave bind:host bind:data />
        {:else}
          <!-- Full add editor -->
          <SelectHost bind:host />
          {#if host}
            <SelectVault {host} bind:vaultid={data.groupid} />
            <SelectTemplate {host} bind:templateid={data.templateid} />
            {#if data.groupid !== undefined && data.templateid !== undefined}
              <TemplateFields
                {host}
                bind:groupid={data.groupid}
                bind:templateid={data.templateid}
                bind:values={data}
                onValidate={(value) => (isValid = value)}
              />
            {/if}
          {/if}
        {/if}
      </Card>
      <div class="sticky-buttons">
        <div class="inline-buttons">
          <button type="submit" disabled={!isValid}>
            {getMessage(LocalizedMessage.ADD_CREATE)}
          </button>
          {#if !edit}
            <button type="button" class="warning" onclick={() => toggleEdit()}>
              {getMessage(LocalizedMessage.SEARCH_RESULT_EDIT)}
            </button>
          {/if}
        </div>
        <button type="button" class="danger" onclick={() => onClose()}>
          {getMessage(LocalizedMessage.IFRAME_CLOSE)}
        </button>
        {#if !edit}
          <button
            type="button"
            class="danger ignore"
            onclick={() => addToIgnore()}
          >
            {getMessage(LocalizedMessage.SAVE_IGNORE)}
          </button>
        {/if}
      </div>
    </form>
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
