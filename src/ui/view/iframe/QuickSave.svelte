<script lang="ts">
  import { structure } from "../../stores";
  import SelectHost from "../lib/pages/add/SelectHost.svelte";
  import SelectVault from "../lib/pages/add/SelectVault.svelte";
  import SavePreview from "./SavePreview.svelte";

  export let host: string;
  export let data: Record<string, string> = {};

  interface SavePreviewProps {
    icon: string;
    template: string;
    title: string;
    username: string;
    url: string;
  }

  $: template = $structure
    .get(host)
    ?.templates?.find(({ id }) => id === data.templateid);

  let saveItemProps: SavePreviewProps;
  $: {
    if (!!template) {
      saveItemProps = {
        icon: template.icon,
        template: template.name,
        title: data.name,
        username: data.username,
        url: data.url,
      };
    }
  }
</script>

<SelectHost bind:host />
{#if !!host}
  <SelectVault {host} bind:groupid={data.groupid} />
{/if}
{#if saveItemProps}
  <SavePreview {...saveItemProps} />
{/if}
