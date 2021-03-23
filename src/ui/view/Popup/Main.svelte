<script lang="ts">
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
  import PasswordGenerator from "../lib/pages/passwordGenerator/PasswordGenerator.svelte";
  import Welcome from "../lib/pages/welcome/Welcome.svelte";
  import DebugButton from "../lib/pages/debug/DebugButton.svelte";
  import Debug from "../lib/pages/debug/Debug.svelte";
  import Options from "../lib/pages/options/Options.svelte";
  import { onDestroy } from "svelte";

  // Set up state
  let page: Page = null;
  let content: HTMLElement = null;

  let hasSites: boolean = false;
  let isOnline: boolean = false;
  $: menuItems = isOnline ? mainMenu : offlineMenu;

  const unsubscribeFromSessions = sessions.subscribe((newSessions) => {
    isOnline = newSessions.size > 0;
    // If online and page isn't already set, go to search
    if (isOnline && page === null) page = Page.SEARCH;
    // If offline and page is not in offline menu, go to sessions
    else if (
      !isOnline &&
      offlineMenu.findIndex(({ name }) => name === page) === -1
    )
      page = Page.SESSIONS;
    // Else let page remain the same
  });

  const unsubscribeFromSites = sites.subscribe((newSites) => {
    hasSites = newSites.length > 0;
    // If sites exist and previous page was welcome, go to sessions
    if (hasSites && page === Page.WELCOME) page = Page.SESSIONS;
    // If no sites exist, go to welcome page
    else if (!hasSites) page = Page.WELCOME;
    // Else let page remain the same
  });

  onDestroy(() => {
    unsubscribeFromSessions();
    unsubscribeFromSites();
  });

  /**
   * Set the active page and clear messages.
   * */
  function setPage(newPage: Page) {
    messages.clear();
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

<!--
  @component
  UI entrypoint of popup
-->
<section class="main">
  <nav class="grid shadow">
    <DebugButton on:open-debug={() => setPage(Page.DEBUG)} />
    {#if isOnline}
      <SearchBar focus={page === Page.SEARCH} on:focus={handleSearchFocus} />
    {:else}
      <Logo />
    {/if}
    {#if hasSites}
      <Menu on:navigate={handleNavigate} selected={page} {menuItems} />
    {/if}
    <LoadingBar isLoading={$loading.isLoading} />
    <MessageViewer {messages} />
  </nav>
  <article class="content" bind:this={content}>
    <div class="spacer">
      {#if page === Page.WELCOME}
        <div>
          <Welcome />
        </div>
      {:else if page === Page.SEARCH && !$loading.has(...searchRequirements)}
        <div>
          <Search on:scrollTo={handleScroll} />
        </div>
      {:else if page === Page.ADD && !$loading.has(...addRequirements)}
        <div>
          <Add on:scrollTo={handleScroll} />
        </div>
      {:else if page === Page.GENERATE_PASSWORD}
        <div>
          <PasswordGenerator on:scrollTo={handleScroll} />
        </div>
      {:else if page === Page.SESSIONS}
        <div>
          <SessionsPage on:scrollTo={handleScroll} />
        </div>
      {:else if page === Page.OPTIONS}
        <div>
          <Options />
        </div>
      {:else if page === Page.DEBUG}
        <Debug />
      {/if}
    </div>
  </article>
</section>

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
    overflow: hidden scroll;
  }

  .spacer {
    padding: var(--spacing);
  }
</style>
