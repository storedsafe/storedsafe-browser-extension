<script lang="ts">
  import {
    Page,
    pagesToRoutes,
    mainMenu,
    offlineMenu,
    nonMenuPages,
  } from "./pages";
  import { sessions, sites, messages, loading } from "@/ui/stores";

  import SearchBar from "@/ui/view/lib/pages/search/SearchBar.svelte";
  import Menu from "@/ui/view/lib/menus/Menu.svelte";
  import LoadingBar from "@/ui/view/lib/layout/LoadingBar.svelte";
  import MessageViewer from "@/ui/view/lib/layout/MessageViewer.svelte";
  import Logo from "@/ui/view/lib/layout/Logo.svelte";
  import Welcome from "@/ui/view/lib/pages/welcome/Welcome.svelte";
  import DebugButton from "@/ui/view/lib/pages/debug/DebugButton.svelte";
  import { router } from "@/ui/stores/router.svelte";
  import Debug from "../lib/pages/debug/Debug.svelte";
  import { untrack } from "svelte";

  // Set up state
  let hasSites: boolean = $derived(sites.data.length > 0);
  let isOnline: boolean = $derived(sessions.data.size > 0);
  let debug: boolean = $state(false);
  let menuItems = $derived(isOnline ? mainMenu : offlineMenu);
  let routes = $derived(pagesToRoutes([...nonMenuPages, ...menuItems]));
  let content: HTMLElement | null = null;

  function getDefaultPage(currentPage: string): string {
    const validRoutes = Object.keys(routes);
    for (const route of validRoutes) {
      // Page is one of the valid routes or one of their subroutes
      if (currentPage.startsWith(route)) {
        if (currentPage === Page.SEARCH && !isOnline) return Page.SESSIONS;
        return currentPage;
      }
    }
    if (isOnline) return Page.SEARCH;
    return Page.SESSIONS;
  }

  $effect(() => {
    untrack(() => router).setRoutes(routes);
    const defaultPage = getDefaultPage(router.route);
    if (router.route !== defaultPage) {
      untrack(() => router).goto(defaultPage);
    }
  });

  ////////////////////////////////////////////////////////////
  // Event handlers

  /**
   * Scroll content container to position.
   * */
  function handleScroll(offset: number) {
    const scrollTop = offset;
    if (content) content.scrollTop = scrollTop;
  }

  function navigate(page: Page) {
    debug = false;
    router.goto(page);
  }
</script>

<!--
  @component
  UI entrypoint of popup
-->
<section class="main">
  <nav class="grid shadow">
    <DebugButton toggleDebug={() => (debug = !debug)} />
    {#if isOnline}
      {#if router.route === Page.SEARCH}
        <SearchBar autoFocus={true} onFocus={() => navigate(Page.SEARCH)} />
      {:else}
        <SearchBar autoFocus={false} onFocus={() => navigate(Page.SEARCH)} />
      {/if}
    {:else}
      <Logo />
    {/if}
    {#if hasSites}
      <Menu onNavigate={navigate} selected={router.route} {menuItems} />
    {/if}
    <LoadingBar isLoading={loading.isLoading} />
    <MessageViewer {messages} />
  </nav>
  <article class="content" bind:this={content}>
    <div class="spacer">
      {#if debug}
        <Debug />
      {:else if !hasSites}
        <div>
          <Welcome />
        </div>
      {:else}
        <router.component {...router.props} />
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
