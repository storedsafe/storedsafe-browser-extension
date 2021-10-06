<script lang="ts" context="module">
  export const searchRequirements = [
    SITES_ADD_LOADING_ID,
    SITES_REMOVE_LOADING_ID,
    SESSIONS_LOGIN_LOADING_ID,
    SESSIONS_LOGOUT_LOADING_ID,
    STRUCTURE_REFRESH_LOADING_ID,
  ];
</script>

<script lang="ts">
  import { beforeUpdate, createEventDispatcher } from "svelte";

  import type { ListItem } from "../../menus/ListView";
  import {
    search,
    structure,
    sites,
    SESSIONS_LOGIN_LOADING_ID,
    STRUCTURE_REFRESH_LOADING_ID,
    SESSIONS_LOGOUT_LOADING_ID,
    SITES_ADD_LOADING_ID,
    SITES_REMOVE_LOADING_ID,
    messageStore
  } from "../../../../stores";
  import { getMessage, LocalizedMessage } from "../../../../../global/i18n";

  import ListView from "../../menus/ListView.svelte";
  import SearchItem from "./SearchItem.svelte";
  import Result from "./Result.svelte";
  import MessageViewer from "../../layout/MessageViewer.svelte";

  const dispatch = createEventDispatcher();

  interface SearchItemProps {
    icon: string;
    template: string;
    title: string;
    username?: string;
    host?: string;
    vault: StoredSafeVault;
    id: string;
  }

  function parseSearchItem(
    result: StoredSafeObject
  ): ListItem<SearchItemProps> {
    const showHost = $sites.length > 1;
    const vault = $structure
      .get(result.host)
      .vaults.find(({ id }) => id === result.vaultId);
    return {
      component: SearchItem,
      name: result.host + result.id,
      props: {
        icon: result.icon,
        template: result.type,
        title: result.name,
        username: result.fields.find((field) => field.name === "username")
          ?.value,
        host: showHost ? result.host : null,
        vault,
        id: result.id,
      },
    };
  }

  const searchMessages = messageStore();

  let selected: string = null;
  let result: StoredSafeObject;
  let items: ListItem<SearchItemProps>[]

  $: {
    items = $search.map(parseSearchItem);
    result = $search.find(({ host, id }) => selected === host + id);
    selected = !!result ? selected : null;
  }

  function selectResult(value: string): void {
    selected = value;
    dispatch("scrollTo", 0);
  }

  beforeUpdate(() => {
    if (result === undefined) selected = null;
  });

  const handleSelectResult = (e: CustomEvent<string>) => selectResult(e.detail);
</script>

<style>
  .empty {
    text-align: center;
  }
</style>

<section class="grid">
  <MessageViewer messages={searchMessages} />
  {#if items.length > 0}
    <ListView on:select={handleSelectResult} {selected} {items} />
  {:else}
    <p class="empty">{getMessage(LocalizedMessage.SEARCH_EMPTY)}</p>
  {/if}
  {#if !!result}
    <Result {result} />
  {/if}
</section>
