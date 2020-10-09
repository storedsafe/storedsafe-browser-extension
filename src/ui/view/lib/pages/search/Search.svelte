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
  import { afterUpdate, beforeUpdate, createEventDispatcher } from "svelte";

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
    messages,
    MessageType,
  } from "../../../../stores";
  import { getMessage, LocalizedMessage } from "../../../../../global/i18n";

  import ListView from "../../menus/ListView.svelte";
  import SearchItem from "./SearchItem.svelte";
  import Result from "./Result.svelte";

  const dispatch = createEventDispatcher();

  export let needle: string;
  let previousNeedle: string = needle;

  interface SearchItemProps {
    icon: string;
    template: string;
    title: string;
    username?: string;
    host?: string;
    vault: StoredSafeVault;
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
      },
    };
  }

  let errorMessageId: number = null;
  let selected: string = null;
  let result: StoredSafeObject;

  $: items = $search.map(parseSearchItem);
  $: result = $search.find(({ host, id }) => selected === host + id);

  function selectResult(value: string): void {
    selected = value;
    dispatch("scrollTo", 0);
  }

  function clearErrorMessage(): void {
    if (errorMessageId !== null) {
      messages.remove(errorMessageId);
      errorMessageId = null;
    }
  }

  function setErrorMessage(error: string): void {
    clearErrorMessage();
    if (errorMessageId !== null) messages.remove(errorMessageId);
    errorMessageId = messages.add(error, MessageType.ERROR);
  }

  function find(): void {
    search
      .search(needle)
      .then(() => {
        clearErrorMessage();
        selectResult(null);
      })
      .catch((error: Error) => {
        setErrorMessage(error.message);
      });
  }

  beforeUpdate(() => {
    if (result === undefined) selected = null;
  });

  afterUpdate(() => {
    if (previousNeedle !== needle) {
      previousNeedle = needle;
      find();
    }
  });

  const handleSelectResult = (e: CustomEvent<string>) => selectResult(e.detail);
</script>

<style>
  .empty {
    text-align: center;
  }
</style>

<section class="grid">
  {#if items.length > 0}
    <ListView on:select={handleSelectResult} {selected} {items} />
  {:else}
    <p class="empty">{getMessage(LocalizedMessage.SEARCH_EMPTY)}</p>
  {/if}
  {#if !!result}
    <Result {result} />
  {/if}
</section>