<script lang="ts" module>
  export interface Props {
    host: string;
    templateid: string;
  }
</script>

<script lang="ts">
  import { getMessage, LocalizedMessage } from "@/global/i18n";
  import { Duration, instances, messages, MessageType } from "@/ui/stores";

  let { host, templateid = $bindable() }: Props = $props();

  let templates: StoredSafeTemplate[] = $derived(
    instances.instances.get(host)?.templates ?? []
  );

  function getDefaultTemplate(): string {
    if (!templates) {
      messages.add(
        "Templates are not set, invalid state.",
        MessageType.ERROR,
        Duration.MEDIUM
      );
      return "";
    }
    // Default template #20 (Login Info), best adapted for browser extension
    const loginInfo = templates.find(({ id }) => id === "20");
    if (!!loginInfo) return loginInfo.id;
    return templates[0]?.id ?? "";
  }

  $effect(() => {
    // Reselect the vault when the vault list changes.
    // Depends on the `vaults` derived store.
    templateid = getDefaultTemplate();
  });
</script>

{#if !!host && !!templates}
  <label for="template">
    <span>{getMessage(LocalizedMessage.ADD_TEMPLATE)}</span>
    <select id="template" bind:value={templateid}>
      {#each templates as template (template.id)}
        <option value={template.id}>{template.name}</option>
      {/each}
    </select>
  </label>
{/if}
