<script lang="ts">
  import { getMessage, LocalizedMessage } from "@/global/i18n";
  import {
    errorIcon,
    optionsIcon,
    storedSafeIcon,
    warningIcon,
    // infoIcon,
  } from "@/global/icons";
  import { messages } from "@/ui/stores";

  import type { ListItem } from "@/ui/view/lib/menus/ListView";

  import ListView from "@/ui/view/lib/menus/ListView.svelte";
  // import About from "./About.svelte";
  import GeneralSettings from "./GeneralSettings.svelte";
  import IgnoreList from "./IgnoreList.svelte";
  import ManageData from "./ManageData.svelte";
  import ManageSites from "./ManageSites.svelte";
  import OptionsItem from "./OptionsItem.svelte";
  import type { Props as OptionsItemProps } from "./OptionsItem.svelte";

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
    // {
    //   component: OptionsItem,
    //   name: "about",
    //   props: {
    //     title: getMessage(LocalizedMessage.OPTIONS_ABOUT_TITLE),
    //     subtitle: getMessage(LocalizedMessage.OPTIONS_ABOUT_SUBTITLE),
    //     icon: infoIcon,
    //   },
    // },
  ];

  interface Props {
    scrollTo?: (offset: number) => void;
  }

  let { scrollTo }: Props = $props();

  let selected: string | null = $state(null);
  let selectedItem = $derived(items.find(({ name }) => name === selected));

  function handleSelectOptions(name: any) {
    messages.clear();
    selected = name;
    if (selected !== null) scrollTo?.(0);
  }

  const manifest = browser.runtime.getManifest();
</script>

<section class="grid">
  <div class="list">
    <ListView onSelect={handleSelectOptions} {selected} {items} />
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
      <!-- {:else if selected === "about"}
      <About /> -->
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
