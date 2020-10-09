<script lang="ts">
  import { slide } from "svelte/transition";

  import { Page, mainMenu, offlineMenu } from "./pages";
  import { sessions, sites, messages, loading } from "../../stores";

  import SearchBar from "../lib/pages/search/SearchBar.svelte";
  import Menu from "../lib/menus/Menu.svelte";
  import LoadingBar from "../lib/layout/LoadingBar.svelte";
  import Add, { addRequirements } from "../lib/pages/add/Add.svelte";
  import Search, {
    searchRequirements,
  } from "../lib/pages/search/Search.svelte";
  import SessionsPage from "../lib/pages/sessions/Sessions.svelte";
  import MessageViewer from "../lib/layout/MessageViewer.svelte";
  import Logo from "../lib/layout/Logo.svelte";
  import PasswordGenerator from "../lib/pages/PasswordGenerator.svelte";
  import Welcome from "../lib/pages/welcome/Welcome.svelte";
  import DebugButton from "../lib/pages/debug/DebugButton.svelte";
  import Debug from "../lib/pages/debug/Debug.svelte";
  import Options from "../lib/pages/options/Options.svelte";

  // Set up state
  let page: Page;
  let needle: string = "";
  let content: HTMLElement = null;

  // Computed properties
  $: hasSites = $sites.length > 0;
  $: isOnline = $sessions.size > 0;
  $: menuItems = isOnline ? mainMenu : offlineMenu;
  $: {
    if (!hasSites) page = Page.WELCOME;
    else if (!isOnline) page = Page.SESSIONS;
    else page = Page.SEARCH;
  }

  /**
   * Set the active page and clear messages.
   * */
  function setPage(newPage: Page) {
    // messages = [];
    !!content && (content.scrollTop = 0);
    if (page === Page.DEBUG && page === newPage) {
      // No menu for debug, revert to default selection to toggle
      if (!hasSites) page = Page.WELCOME;
      else if (!isOnline) page = Page.SESSIONS;
      else page = Page.SEARCH;
    } else {
      page = newPage;
    }
  }

  ////////////////////////////////////////////////////////////
  // Event handlers

  /**
   * Perform search if needle has changed.
   * */
  function handleSearch(e: CustomEvent<string>) {
    setPage(Page.SEARCH);
    needle = e.detail;
  }

  /**
   * Set page to search if search bar is focused
   * */
  function handleSearchFocus() {
    setPage(Page.SEARCH);
  }

  /**
   * Update page when nav menu item is clicked.
   * */
  function handleNavigate(e: CustomEvent<Page>) {
    setPage(e.detail);
  }

  /**
   * Scroll content container to position.
   * */
  function handleScroll(e: CustomEvent<number>) {
    const scrollTop = e.detail;
    content.scrollTop = scrollTop;
  }
</script>

<style>
  .main {
    max-height: 540px;
    display: grid;
    grid-template-rows: auto 1fr;
  }

  nav {
    background-color: var(--color-primary);
    padding: var(--spacing);
    position: relative;
  }

  .content {
    padding: var(--spacing);
    overflow: hidden scroll;
  }
</style>

<!--
  @component
  UI entrypoint of popup
-->
<section class="main" transition:slide>
  <nav class="grid shadow">
    <DebugButton on:open-debug={() => setPage(Page.DEBUG)} />
    {#if isOnline}
      <SearchBar on:search={handleSearch} on:focus={handleSearchFocus} />
    {:else}
      <Logo />
    {/if}
    {#if hasSites}
      <Menu on:navigate={handleNavigate} selected={page} {menuItems} />
    {/if}
    <LoadingBar isLoading={$loading.isLoading} />
    <MessageViewer messages={messages} />
  </nav>
  <article class="content" bind:this={content}>
    {#if page === Page.WELCOME}
      <div transition:slide>
        <Welcome />
      </div>
    {:else if page === Page.SEARCH && !$loading.has(...searchRequirements)}
      <div transition:slide>
        <Search on:scrollTo={handleScroll} {needle} />
      </div>
    {:else if page === Page.ADD && !$loading.has(...addRequirements)}
      <div transition:slide>
        <Add on:scrollTo={handleScroll} />
      </div>
    {:else if page === Page.GENERATE_PASSWORD}
      <div transition:slide>
        <PasswordGenerator on:scrollTo={handleScroll} />
      </div>
    {:else if page === Page.SESSIONS}
      <div transition:slide>
        <SessionsPage on:scrollTo={handleScroll} />
      </div>
    {:else if page === Page.OPTIONS}
      <div transition:slide>
        <Options />
      </div>
    {:else if page === Page.DEBUG}
      <Debug />
    {/if}
  </article>
</section>
