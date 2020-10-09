<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import type { ListItem } from "../../menus/ListView";

  import { sites, sessions } from "../../../../stores";

  import ListView from "../../menus/ListView.svelte";
  import SessionItem from "./SessionItem.svelte";
  import Login from "./Login.svelte";
  import SiteInfo from "./SiteInfo.svelte";

  const dispatch = createEventDispatcher();

  interface SessionItemProps {
    host: string;
    isOnline: boolean;
    hasWarnings: boolean;
    hasViolations: boolean;
  }

  function parseSite(site: Site): ListItem<SessionItemProps> {
    const { host } = site;
    const isOnline = $sessions.has(host);
    let hasViolations = false;
    let hasWarnings = false;
    if (isOnline) {
      const { violations, warnings } = $sessions.get(host);
      hasViolations = Object.keys(violations).length > 0;
      hasWarnings = Object.keys(warnings).length > 0;
    }

    return {
      component: SessionItem,
      name: host,
      props: {
        host,
        isOnline,
        hasWarnings,
        hasViolations,
      },
    };
  }

  let items: ListItem<SessionItemProps>[];
  $: {
    items = $sites.map(parseSite);
    if (items.length === 1) {
      selected = items[0].name;
    } else {
      // Sort by online status
      // Check b first to retain original order as secondary ordering
      items.sort((a, b) => (b.props.isOnline ? 1 : a.props.isOnline ? -1 : 1));
    }
  }

  let selected: string = null;
  $: selectedSession = $sessions.get(selected)
  $: selectedSite = $sites.find(({ host }) => host === selected)

  function handleSelectSite(e: CustomEvent<string>) {
    selected = e.detail;
    if (selected !== null) dispatch("scrollTo", 0);
  }
</script>

<style>
  .list {
    padding-right: var(--spacing);
    margin-right: calc(var(--spacing) * -1);
  }
</style>

<section class="grid">
  {#if items.length > 1}
    <div class="list">
      <ListView on:select={handleSelectSite} {selected} {items} />
    </div>
  {:else if items.length === 1 && !!selectedSite}
    <h2>{selectedSite.host}</h2>
  {/if}
  {#if !!selectedSession && !!selectedSite}
    <SiteInfo host={selectedSite.host} session={selectedSession} />
  {:else if !!selectedSite}
    <Login site={selectedSite} />
  {/if}
</section>
