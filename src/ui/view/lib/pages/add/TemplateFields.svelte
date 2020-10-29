<script lang="ts">
  import { structure } from "../../../../stores";
  import PasswordInput from "../../layout/PasswordInput.svelte";
  import AddField from "./AddField.svelte";

  export let host: string;
  export let templateid: string;
  export let groupid: string;
  export let values: Record<string, string>;

  $: template = $structure
    .get(host)
    ?.templates?.find(({ id }) => id === templateid);
  $: vault = $structure.get(host)?.vaults?.find(({ id }) => id === groupid);
  $: policy = $structure
    .get(host)
    ?.policies?.find(({ id }) => id === vault?.policyId);
</script>

{#if !!template && !!policy}
  {#each template?.structure as field (host + values.templateid + field.name)}
    <!-- StoredSafe Template -->
    {#if field.pwgen}
      <PasswordInput {field} bind:value={values[field.name]} {host} {policy} />
    {:else}
      <AddField {field} bind:value={values[field.name]} />
    {/if}
  {/each}
{/if}
