<script lang="ts" module>
  interface Props {
    scrollTo?: (offset: number) => void;
  }

  export const searchRequirements = [
    SITES_ADD_LOADING_ID,
    SITES_REMOVE_LOADING_ID,
    SESSIONS_LOGIN_LOADING_ID,
    SESSIONS_LOGOUT_LOADING_ID,
    INSTANCES_REFRESH_LOADING_ID,
  ];
</script>

<script lang="ts">
  import type { ListItem } from "@/ui/view/lib/menus/ListView";
  import {
    SESSIONS_LOGIN_LOADING_ID,
    INSTANCES_REFRESH_LOADING_ID,
    SESSIONS_LOGOUT_LOADING_ID,
    SITES_ADD_LOADING_ID,
    SITES_REMOVE_LOADING_ID,
    search,
    instances,
    sites,
    Messages,
  } from "@/ui/stores";
  import { getMessage, LocalizedMessage } from "@/global/i18n";

  import ListView from "@/ui/view/lib/menus/ListView.svelte";
  import MessageViewer from "@/ui/view/lib/layout/MessageViewer.svelte";

  import SearchItem from "./SearchItem.svelte";
  import type { Props as SearchItemProps } from "./SearchItem.svelte";
  import Result from "./Result.svelte";
  import { StoredSafeExtensionError } from "@/global/errors";

  let { scrollTo }: Props = $props();

  function parseSearchItem(
    result: StoredSafeObject
  ): ListItem<SearchItemProps> {
    const showHost = sites.data.length > 1;
    const vault = instances.instances
      .get(result.host)
      ?.vaults.find(({ id }) => id === result.vaultId);
    if (!vault) {
      throw new StoredSafeExtensionError("Vault is not set, invalid state.");
    }
    return {
      Component: SearchItem,
      name: result.host + result.id,
      props: {
        icon: result.icon,
        template: result.type,
        title: result.name,
        username: result.fields.find((field) => field.name === "username")
          ?.value,
        host: showHost ? result.host : "",
        vault,
        id: result.id,
      },
    };
  }

  const searchMessages = new Messages();

  let selected: string | null = $state(null);
  let result: StoredSafeObject | null = $state(null);
  let items: ListItem<SearchItemProps>[] = $derived.by(() => {
    if (!sites.isInitialized || !instances.isInitialized) return [];
    return search.results.map(parseSearchItem);
  });

  $effect(() => {
    const newResult =
      search.results.find(({ host, id }) => selected === host + id) ?? null;
    selected = !!newResult ? selected : null;
    result = newResult;
  });

  function selectResult(value: string | null): void {
    selected = value;
    scrollTo?.(0);
  }
</script>

<section class="grid">
  <MessageViewer messages={searchMessages} />
  {#if items.length > 0}
    <ListView onSelect={selectResult} {selected} {items} />
  {:else}
    <p class="empty">{getMessage(LocalizedMessage.SEARCH_EMPTY)}</p>
  {/if}
  {#if !!result}
    <Result {result} />
  {/if}
</section>

<style>
  .empty {
    text-align: center;
  }
</style>
