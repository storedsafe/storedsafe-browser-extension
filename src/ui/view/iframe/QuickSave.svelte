<script lang="ts">
  import { getMessage, LocalizedMessage } from "../../../global/i18n";
  import { preferences, sites, structure } from "../../stores";
  import Card from "../lib/layout/Card.svelte";
  import SavePreview from "./SavePreview.svelte";

  export let host: string;
  export let data: Record<string, string> = {};

  $: host = $preferences?.add?.lastHost ?? $sites?.[0]?.host;

  interface SavePreviewProps {
    icon: string;
    template: string;
    title: string;
    username: string;
    url: string;
  }

  let templates: StoredSafeTemplate[];
  let vaults: StoredSafeVault[];
  let template: StoredSafeTemplate;
  let saveItemProps: SavePreviewProps;
  $: {
    const LOGIN_INFO_TEMPLATE_ID = "20";
    templates = $structure.get(host)?.templates ?? [];
    vaults = $structure.get(host)?.vaults ?? [];
    template =
      templates.find(({ id }) => id === LOGIN_INFO_TEMPLATE_ID) ??
      templates?.[0];
    data.groupid = vaults.find(
      ({ id }) => id === $preferences?.add?.hosts[host]
    ).id;
    data.templateid = template.id;
    saveItemProps = {
      icon: template.icon,
      template: template.name,
      title: data.name,
      username: data.username,
      url: data.url,
    };
  }
</script>

<Card>
  <label for="host">
    {getMessage(LocalizedMessage.ADD_HOST)}
    <select id="host" bind:value={host}>
      {#each [...$structure.keys()] as host (host)}
        <option value={host}>{host}</option>
      {/each}
    </select>
  </label>
  <label for="vault">
    {getMessage(LocalizedMessage.ADD_VAULT)}
    <select id="vault" bind:value={data.groupid}>
      {#each vaults as vault (vault.id)}
        <option value={vault.id}>{vault.name}</option>
      {/each}
    </select>
  </label>
  <SavePreview {...saveItemProps} />
</Card>
