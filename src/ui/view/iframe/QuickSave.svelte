<script lang="ts" module>
  export interface Props {
    host: string;
    data: Record<string, string>;
  }
</script>

<script lang="ts">
  import { instances } from "@/ui/stores";
  import SelectHost from "@/ui/view/lib/pages/add/SelectHost.svelte";
  import SelectVault from "@/ui/view/lib/pages/add/SelectVault.svelte";
  import SavePreview from "./SavePreview.svelte";

  let { host, data = {} }: Props = $props();

  interface SavePreviewProps {
    icon: string;
    template: string;
    title: string;
    username: string;
    url: string;
  }

  let template = $derived(
    instances.instances
      .get(host)
      ?.templates?.find(({ id }) => id === data.templateid)
  );

  let saveItemProps: SavePreviewProps | null = $derived.by(() => {
    if (!template) return null;
    return {
      icon: template.icon,
      template: template.name,
      title: data.name,
      username: data.username,
      url: data.url,
    };
  });
</script>

<SelectHost bind:host />
{#if !!host}
  <SelectVault {host} bind:vaultid={data.groupid} />
{/if}
{#if saveItemProps}
  <SavePreview {...saveItemProps} />
{/if}
