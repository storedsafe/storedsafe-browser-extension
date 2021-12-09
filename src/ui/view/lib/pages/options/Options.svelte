<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { getMessage, LocalizedMessage } from "../../../../../global/i18n";
  import {
    errorIcon,
    optionsIcon,
    storedSafeIcon,
    warningIcon,
    infoIcon,
  } from "../../../../../global/icons";
  import { messages } from "../../../../stores";

  import type { ListItem } from "../../menus/ListView";

  import ListView from "../../menus/ListView.svelte";
  import About from "./About.svelte";
  import GeneralSettings from "./GeneralSettings.svelte";
  import IgnoreList from "./IgnoreList.svelte";
  import ManageData from "./ManageData.svelte";
  import ManageSites from "./ManageSites.svelte";
  import OptionsItem from "./OptionsItem.svelte";

  const dispatch = createEventDispatcher();

  interface OptionsItemProps {
    title: string;
    subtitle: string;
    icon: string;
  }

  let items: ListItem<OptionsItemProps>[] = [
    {
      component: OptionsItem,
      name: "general",
      props: {
        title: getMessage(LocalizedMessage.OPTIONS_GENERAL_TITLE),
        subtitle: getMessage(LocalizedMessage.OPTIONS_GENERAL_SUBTITLE),
        icon: optionsIcon,
      },
    },
    {
      component: OptionsItem,
      name: "sites",
      props: {
        title: getMessage(LocalizedMessage.OPTIONS_SITES_TITLE),
        subtitle: getMessage(LocalizedMessage.OPTIONS_SITES_SUBTITLE),
        icon: storedSafeIcon,
      },
    },
    {
      component: OptionsItem,
      name: "ignore",
      props: {
        title: getMessage(LocalizedMessage.OPTIONS_IGNORE_TITLE),
        subtitle: getMessage(LocalizedMessage.OPTIONS_IGNORE_SUBTITLE),
        icon: warningIcon,
      },
    },
    {
      component: OptionsItem,
      name: "data",
      props: {
        title: getMessage(LocalizedMessage.OPTIONS_DATA_TITLE),
        subtitle: getMessage(LocalizedMessage.OPTIONS_DATA_SUBTITLE),
        icon: errorIcon,
      },
    },
    {
      component: OptionsItem,
      name: "about",
      props: {
        title: getMessage(LocalizedMessage.OPTIONS_ABOUT_TITLE),
        subtitle: getMessage(LocalizedMessage.OPTIONS_ABOUT_SUBTITLE),
        icon: infoIcon,
      },
    },
  ];

  let selected: string = null;
  $: selectedItem = items.find(({ name }) => name === selected);

  function handleSelectOptions(e: CustomEvent<string>) {
    messages.clear();
    selected = e.detail;
    if (selected !== null) dispatch("scrollTo", 0);
  }

  const manifest = browser.runtime.getManifest();
</script>

<section class="grid">
  <div class="list">
    <ListView on:select={handleSelectOptions} {selected} {items} />
  </div>
  {#if !!selectedItem}
    {#if selected === "general"}
      <GeneralSettings />
    {:else if selected === "data"}
      <ManageData />
    {:else if selected === "ignore"}
      <IgnoreList />
    {:else if selected === "sites"}
      <ManageSites />
    {:else if selected === "about"}
      <About />
    {/if}
  {:else if !!manifest}
    <p class="version subtitle">v{manifest.version}</p>
  {/if}
</section>

<style>
  .list {
    padding-right: var(--spacing);
    margin-right: calc(var(--spacing) * -1);
  }

  .version {
    text-align: center;
    color: var(--color-primary-light);
  }
</style>
