<script lang="ts">
  import { Page, mainMenu, offlineMenu } from "./pages";
  import { sessions, sites, messages, loading } from "@/ui/stores";

  import SearchBar from "@/ui/view/lib/pages/search/SearchBar.svelte";
  import Menu from "@/ui/view/lib/menus/Menu.svelte";
  import LoadingBar from "@/ui/view/lib/layout/LoadingBar.svelte";
  import Add, { addRequirements } from "@/ui/view/lib/pages/add/Add.svelte";
  import Search, {
    searchRequirements,
  } from "@/ui/view/lib/pages/search/Search.svelte";
  import SessionsPage from "@/ui/view/lib/pages/sessions/Sessions.svelte";
  import MessageViewer from "@/ui/view/lib/layout/MessageViewer.svelte";
  import Logo from "@/ui/view/lib/layout/Logo.svelte";
  import PasswordGenerator from "@/ui/view/lib/pages/passwordGenerator/PasswordGenerator.svelte";
  import Welcome from "@/ui/view/lib/pages/welcome/Welcome.svelte";
  import DebugButton from "@/ui/view/lib/pages/debug/DebugButton.svelte";
  import Debug from "@/ui/view/lib/pages/debug/Debug.svelte";
  import Options from "@/ui/view/lib/pages/options/Options.svelte";

  // Set up state
  let hasSites: boolean = $derived(sites.data.length > 0);
  let isOnline: boolean = $derived(sessions.data.size > 0);
  let menuItems = $derived(isOnline ? mainMenu : offlineMenu);

  let page: Page | null = $state(Page.WELCOME);
  let content: HTMLElement | null = null;

  // When sessions changes
  $effect(() => {
    // Set default page
    if (isOnline && page === null) {
      // Default to search if user is logged in
      page = Page.SEARCH;
    } else if (
      !isOnline &&
      offlineMenu.findIndex(({ name }) => name === page) === -1
    ) {
      // Default to login if user is not logged in
      page = Page.SESSIONS;
    }
  });

  // When sites changes
  $effect(() => {
    // Welcome page should only be shown when no sites are configured
    if (hasSites && page === Page.WELCOME) page = Page.SESSIONS;
    // Default to welcome page if no sites are configured
    else if (!hasSites) page = Page.WELCOME;
  });

  /**
   * Set the active page and clear messages.
   * */
  function setPage(newPage: Page) {
    console.log("Page: %o", newPage)
    messages.clear();
    if (content) content.scrollTop = 0;
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
   * Scroll content container to position.
   * */
  function handleScroll(offset: number) {
    const scrollTop = offset;
    if (content) content.scrollTop = scrollTop;
  }
  $inspect(page)
</script>

<!--
  @component
  UI entrypoint of popup
-->
<section class="main">
  <nav class="grid shadow">
    <DebugButton openDebug={() => setPage(Page.DEBUG)} />
    {#if isOnline}
      <SearchBar
        autoFocus={page === Page.SEARCH}
        onFocus={() => setPage(Page.SEARCH)}
      />
    {:else}
      <Logo />
    {/if}
    {#if hasSites}
      <Menu onNavigate={(page) => setPage(page)} selected={page} {menuItems} />
    {/if}
    <LoadingBar isLoading={loading.isLoading} />
    <MessageViewer {messages} />
  </nav>
  <article class="content" bind:this={content}>
    <div class="spacer">
      {#if page === Page.WELCOME}
        <div>
          <Welcome />
        </div>
      {:else if page === Page.SEARCH && !loading.has(...searchRequirements)}
        <div>
          <Search scrollTo={handleScroll} />
        </div>
      {:else if page === Page.ADD && !loading.has(...addRequirements)}
        <div>
          <Add />
        </div>
      {:else if page === Page.GENERATE_PASSWORD}
        <div>
          <PasswordGenerator />
        </div>
      {:else if page === Page.SESSIONS}
        <div>
          <SessionsPage scrollTo={handleScroll} />
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
