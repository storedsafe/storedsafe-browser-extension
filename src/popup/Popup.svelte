<script lang="ts">
  import { onMount } from "svelte";

  interface PopupProps {
    name?: string;
  }

  onMount(async () => {
    const tabs = await browser.tabs.query({
      active: true,
    });
    if (tabs) {
      name = tabs[0].title ?? name;
    }
  });

  let { name = "Popup" }: PopupProps = $props();
</script>

<h1>Hello, {name}!</h1>
