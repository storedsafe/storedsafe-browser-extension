<script lang="ts">
  import { rmSync } from "fs";
  import { getMessage, LocalizedMessage } from "../../../../../global/i18n";
  import Card from "../../layout/Card.svelte";

  const changelogPromise = fetch(browser.runtime.getURL("changelog.json")).then(
    (res) => {
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      return res.json();
    }
  );
  const manifest = browser.runtime.getManifest();
</script>

<section class="grid">
  <Card>
    <h2>StoredSafe Browser Extension</h2>
    <p>Version: {manifest.version}</p>
    <p>Links:</p>
    <ol>
      <li><a href="https://www.storedsafe.com" target="_blank">storedsafe.com</a></li>
      <li>
        <a href="https://www.storedsafe.com/addons/docs/browserextension.html" target="_blank">Extension Documentation</a>
      </li>
    </ol>
  </Card>
  <Card>
    <h2>Changelog</h2>
    {#await changelogPromise}
      <p>Loading changelog...</p>
    {:then changelog}
      {#each Object.keys(changelog) as key}
        <h3>{key}</h3>
        <ol>
          {#each changelog[key] as change}
            <li>{change}</li>
          {/each}
        </ol>
      {/each}
    {:catch err}
      <p>Error loading changelog: {err}</p>
    {/await}
  </Card>
</section>

<style>
  li {
    list-style: circle;
  }

  ol {
    padding-inline-start: 2em;
  }
</style>
