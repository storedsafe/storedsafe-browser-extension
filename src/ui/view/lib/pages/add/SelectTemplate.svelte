<script lang="ts">
  import { afterUpdate } from "svelte";
  import { getMessage, LocalizedMessage } from "../../../../../global/i18n";
  import { structure } from "../../../../stores";

  let oldHost: string = null;
  export let host: string;
  export let templateid: string;

  let templates: StoredSafeTemplate[];

  function getDefaultTemplate(): string {
    if (!templates) return undefined;
    const loginInfo = templates.find(({ id }) => id === "20");
    if (!!loginInfo) return loginInfo.id;
    return templates[0]?.id;
  }

  afterUpdate(() => {
    if (oldHost !== host) {
      oldHost = host;
      let hostStructure = $structure.get(host);
      templates = hostStructure?.templates;
      templateid = getDefaultTemplate();
    }
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
