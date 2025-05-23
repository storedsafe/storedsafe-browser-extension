<script lang="ts">
  import { searchIcon } from "@/global/icons";
  import { getMessage, LocalizedMessage } from "@/global/i18n";

  import Icon from "@/ui/view/lib/layout/Icon.svelte";
  import {
    loading,
    messages,
    MessageType,
    search,
    SEARCH_LOADING_ID,
  } from "@/ui/stores";

  interface Props {
    searchDelay?: number;
    autoFocus?: boolean;
    onFocus?: () => void;
  }

  let { searchDelay = 500, autoFocus = true, onFocus }: Props = $props();

  // Set a fallback default button size until input reference is loaded
  const DEFAULT_BUTTON_SIZE = 36;
  // Reference to form height for button size adjustment
  let formHeight: number = $state(DEFAULT_BUTTON_SIZE);
  // Reference to timer to perform automatic search
  let timerId: number | null = null;
  // Search term (needle to find in the StoredSafe haystack)
  let needle: string = $state("");
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
    if (needle === "") find();
    else timerId = window.setTimeout(find, searchDelay);
  }

  /**
   * Dispatch a search event when the search form is submitted.
   * */
  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
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
  style={`--button-size: ${formHeight}px`}
  role="search"
  bind:offsetHeight={formHeight}
  onsubmit={handleSubmit}
>
  <!-- svelte-ignore a11y_autofocus -->
  <input
    onfocus={() => onFocus?.()}
    oninput={() => handleChange()}
    bind:value={needle}
    autofocus={autoFocus}
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
