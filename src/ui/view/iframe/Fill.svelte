<script lang="ts" module>
  export interface Props {
    onClose: () => void;
    onResize: (height: number, width: number) => void;
  }

  import { Logger } from "@/global/logger";
  const logger = new Logger("fill");
</script>

<script lang="ts">
  import { getMessage, LocalizedMessage } from "@/global/i18n";
  import { Context, sendMessage } from "@/global/messages";
  import {
    instances,
    loading,
    messages,
    MessageType,
    Duration,
  } from "@/ui/stores";

  import LoadingBar from "@/ui/view/lib/layout/LoadingBar.svelte";
  import MessageViewer from "@/ui/view/lib/layout/MessageViewer.svelte";
  import Logo from "@/ui/view/lib/layout/Logo.svelte";
  import ListView from "@/ui/view/lib/menus/ListView.svelte";
  import type { ListItem } from "@/ui/view/lib/menus/ListView";
  import FillPreview, {
    type Props as FillPreviewProps,
  } from "./FillPreview.svelte";
  import { onMount } from "svelte";
  import { StoredSafeExtensionError } from "@/global/errors";

  let { onClose, onResize }: Props = $props();

  let results: StoredSafeObject[] = $state([]);

  let frame: HTMLElement;
  let height: number;

  function resize(height: number, width: number = 300) {
    onResize(height, width);
  }

  $effect(() => {
    if (!!frame && height !== frame.clientHeight) {
      height = frame?.clientHeight;
      resize(height);
    }
  });

  onMount(async () => {
    results = await sendMessage({
      from: Context.FILL,
      to: Context.BACKGROUND,
      action: "tabresults.get",
    });

    // Ensure iframe gets resized (afterUpdate unreliable)
    for (let delay = 200; delay <= 1000; delay += 200) {
      setTimeout(() => {
        height = frame?.clientHeight;
        resize(height);
      }, delay);
    }
  });

  let items: ListItem<FillPreviewProps>[] = $derived.by(() => {
    let newItems: ListItem<FillPreviewProps>[] = [];
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const vault = instances.instances
        .get(result.host)
        ?.vaults?.find(({ id }) => id === result.vaultId);
      if (!vault) throw new StoredSafeExtensionError("Vault not found.");
      newItems.push({
        Component: FillPreview,
        name: i,
        props: {
          icon: result.icon,
          template: result.type,
          title: result.name,
          username: result.fields.find(({ name }) => name === "username")
            ?.value,
          host: result.host,
          vault: vault,
          id: result.id,
        },
      });
    }
    return newItems;
  });

  function onSelect(name: any): void {
    loading.add(`Fill.fill`, fill(results[name]), {
      onError(error) {
        messages.add(error.message, MessageType.ERROR, Duration.LONG);
      },
      onSuccess() {
        onClose();
      },
    });
  }

  async function fill(result: StoredSafeObject): Promise<void> {
    sendMessage({
      from: Context.FILL,
      to: Context.BACKGROUND,
      action: "fill",
      data: result,
    });
  }
</script>

<article class="save" bind:this={frame}>
  <article class="grid">
    <Logo />
    <MessageViewer {messages} />
    <LoadingBar isLoading={loading.isLoading} />
    <ListView {items} {onSelect} />
    <div class="sticky-buttons">
      <button type="button" class="danger" onclick={() => onClose()}
        >{getMessage(LocalizedMessage.IFRAME_CLOSE)}</button
      >
    </div>
  </article>
</article>

<style>
  .save {
    width: 300px;
    max-height: 400px;
    overflow: auto auto;
  }
</style>
