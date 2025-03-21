<script lang="ts" module>
  export interface Props {
    host: string | undefined;
    data: Record<string, string>;
  }
</script>

<script lang="ts">
  import { instances } from "@/ui/stores";
  import SelectHost from "@/ui/view/lib/pages/add/SelectHost.svelte";
  import SelectVault from "@/ui/view/lib/pages/add/SelectVault.svelte";
  import SavePreview from "./SavePreview.svelte";

  let { host = $bindable(), data = $bindable({}) }: Props = $props();

  interface SavePreviewProps {
    icon: string;
    template: string;
    title: string;
    username: string;
    url: string;
  }

  let template: StoredSafeTemplate | undefined = $derived.by(() => {
    const instance = instances.instances.get(host ?? "");
    if (instance) {
      return instance.templates.find(({ id }) => id === data.templateid);
    }
  });

  let saveItemProps: SavePreviewProps | undefined = $derived.by(() => {
    if (template) {
      return {
        icon: template.icon,
        template: template.name,
        title: data.name,
        username: data.username,
        url: data.url,
      };
    }
  });
</script>

<SelectHost bind:host />
{#if !!host}
  <SelectVault {host} bind:vaultid={data.groupid} />
{/if}
{#if saveItemProps}
  <SavePreview {...saveItemProps} />
{/if}
