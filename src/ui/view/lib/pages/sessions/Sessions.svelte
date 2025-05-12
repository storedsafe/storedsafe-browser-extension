<script lang="ts" module>
  export interface Props {
    scrollTo: (offset: number) => void;
  }
</script>

<script lang="ts">
  import type { ListItem } from "@/ui/view/lib/menus/ListView";
  import { sites, sessions } from "@/ui/stores";
  import ListView from "@/ui/view/lib/menus/ListView.svelte";
  import SessionItem from "./SessionItem.svelte";
  import type { Props as SessionItemProps } from "./SessionItem.svelte";
  import Login from "./Login.svelte";
  import SiteInfo from "./SiteInfo.svelte";
  import ListItemBox from "@/ui/view/lib/menus/ListItemBox.svelte";

  let { scrollTo }: Props = $props();

  function parseSite(site: Site): ListItem<SessionItemProps> {
    const { host } = site;
    const session = sessions.data.get(host);
    const isOnline = !!session;
    let hasViolations = false;
    let hasWarnings = false;
    if (session) {
      const { violations, warnings } = session;
      hasViolations = Object.keys(violations).length > 0;
      hasWarnings = Object.keys(warnings).length > 0;
    }

    return {
      Component: SessionItem,
      name: host,
      props: {
        host,
        isOnline,
        hasWarnings,
        hasViolations,
      },
    };
  }

  let items: ListItem<SessionItemProps>[] = $state([]);
  let selected: string | null = $state("");
  let selectedSession = $derived(sessions.data.get(selected));
  let selectedSite = $derived(sites.data.find(({ host }) => host === selected));

  $effect(() => {
    const newItems = sites.data.map(parseSite);
    // Sort by online status
    // Check b first to retain original order as secondary ordering
    newItems.sort((a, b) => (b.props.isOnline ? 1 : a.props.isOnline ? -1 : 1));
    // If only one selection is available, use that
    if (newItems.length === 1) {
      selected = newItems[0].name;
    }
    // Update state variable last to avoid $effect triggering again
    items = newItems;
  });

  function handleSelectSite(name: any) {
    selected = name;
    if (selected !== null) scrollTo?.(0);
  }
</script>

<section class="grid">
  {#if items.length > 1}
    <div class="list">
      <ListView
        onSelect={(name) => handleSelectSite(name)}
        {selected}
        {items}
      />
    </div>
  {:else if items.length === 1 && !!selectedSite}
    <ListItemBox single={true} selected={true}>
      <SessionItem selected={true} {...items[0].props} />
    </ListItemBox>
  {/if}
  {#if !!selectedSession && !!selectedSite}
    <SiteInfo host={selectedSite.host} session={selectedSession} />
  {:else if !!selectedSite}
    <Login site={selectedSite} />
  {/if}
</section>

<style>
  .list {
    padding-right: var(--spacing);
    margin-right: calc(var(--spacing) * -1);
  }
</style>
