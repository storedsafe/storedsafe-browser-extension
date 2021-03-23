<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { searchIcon } from "../../../../../global/icons";
  import { getMessage, LocalizedMessage } from "../../../../../global/i18n";

  import Icon from "../../layout/Icon.svelte";
  import {
    loading,
    messages,
    MessageType,
    search,
    SEARCH_LOADING_ID,
  } from "../../../../stores";

  // Submit search form automatically after `searchDelay` ms.
  export let searchDelay: number = 500;
  // Automatically focus search input
  export let focus: boolean = true;

  // Reference to form height for button size adjustment
  let formHeight: number;
  // Reference to timer to perform automatic search
  let timerId: number = null;
  // Set a fallback default button size until input reference is loaded
  const DEFAULT_BUTTON_SIZE = 36;
  // Search term (needle to find in the StoredSafe haystack)
  let needle: string = "";
  // Set up icon for search button
  const searchIconProps = {
    color: "#ebeef0",
    size: "1.2em",
    d: searchIcon,
  };

  /**
   * Perform search automatically after `searchDelay` ms since last change.
   * Will reset the timeout if search string is changed before the timeout is reached.
   **/
  function handleChange() {
    if (timerId) window.clearTimeout(timerId);
    timerId = window.setTimeout(find, searchDelay);
  }

  /**
   * Dispatch a search event when the search form is submitted.
   * */
  function handleSearch() {
    find();
  }

  function find(): void {
    loading.add(`${SEARCH_LOADING_ID}.${needle}`, search.search(needle), {
      onSuccess() {
        messages.clear();
      },
      onError(error) {
        messages.add(error.message, MessageType.ERROR);
      },
    });
  }
</script>

<!--
  @component
  Search form component, intended for putting at the top of the page.
  Will span the width of its parent and match the height of its contents.
-->
<form
  class="grid"
  style={`--button-size: ${formHeight ?? DEFAULT_BUTTON_SIZE}px`}
  role="search"
  bind:offsetHeight={formHeight}
  on:submit|preventDefault={handleSearch}
>
  <!-- svelte-ignore a11y-autofocus -->
  <input
    on:focus
    on:input={handleChange}
    bind:value={needle}
    autofocus={focus}
    placeholder={getMessage(LocalizedMessage.SEARCH_PLACEHOLDER)}
    aria-label={getMessage(LocalizedMessage.SEARCH_ARIA_LABEL_NEEDLE)}
    type="search"
  />
  <button
    type="submit"
    aria-label={getMessage(LocalizedMessage.SEARCH_ARIA_LABEL_SUBMIT)}
  >
    <Icon {...searchIconProps} />
  </button>
</form>

<style>
  form {
    grid-template-columns: 1fr var(--button-size);
    width: 100%;
    box-sizing: border-box;
  }

  input {
    background: var(--color-primary-dark);
    border-color: var(--color-primary-dark);
    color: #fff;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: 0;
  }

  button {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-left: 0;
  }

  input,
  button {
    margin: 0;
  }

  input:not(:disabled):hover,
  input:not(:disabled):focus {
    background-color: var(--color-primary-dark);
  }
</style>
