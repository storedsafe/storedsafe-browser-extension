<script lang="ts" context="module">
  import { Logger } from "@/global/logger";
  const logger = new Logger("debug");
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { loading, messages, MessageType } from "@/ui/stores";
  import Card from "@/ui/view/lib/layout/Card.svelte";

  const addError = () => messages.add("Debug error message", MessageType.ERROR);
  const addWarning = () =>
    messages.add("Debug warning message", MessageType.WARNING);
  const addInfo = () => messages.add("Debug info message", MessageType.INFO);
  let resolveLoading: ((value: any) => void) | null = null;
  function toggleLoading() {
    if (resolveLoading === null) {
      loading.add(
        "Debug.loading",
        new Promise((resolve) => (resolveLoading = resolve))
      );
    } else {
      resolveLoading(undefined);
      resolveLoading = null;
    }
  }

  const storage = {
    local: {
      title: "Local",
      values: "",
      error: null,
    },
    sync: {
      title: "Sync",
      values: "",
      error: null,
    },
    managed: {
      title: "Managed",
      values: "",
      error: null,
    },
  };

  let logLevel = 1;

  function parseStorage(value: any): string {
    let output = '<div class="entry">';
    if (value === undefined || value === null) {
      output += value + ` <em>(${typeof value})</em>`;
    } else if (Array.isArray(value)) {
      output += "<ul><em>(Array)</em> [";
      for (let i = 0; i < value.length; i++) {
        output += `<li>[<strong>${i}</strong>]: ${parseStorage(value[i])}</li>`;
      }
      output += "]</ul>";
    } else if (typeof value === "object") {
      output += "<ul><em>(Object)</em> {";
      for (const key of Object.keys(value)) {
        output += `<li><strong>${key}</strong>: ${parseStorage(
          value[key]
        )}</li>`;
      }
      output += "}</ul>";
    } else {
      output += value + ` <em>(${typeof value})</em>`;
    }
    output += "</div>";
    return output;
  }

  async function getStorage() {
    for (const key of Object.keys(storage) as (keyof typeof storage)[]) {
      try {
        storage[key].values = parseStorage(await browser.storage[key].get());
        storage[key].error = null;
      } catch (error: any) {
        storage[key].error = error.toString();
      }
    }
  }

  function setLogLevel(e: Event) {
    const select = e.target as HTMLSelectElement;
    browser.storage.local.set({ loglevel: select.value });
  }

  onMount(() => {
    getStorage()
      .then(() => {})
      .catch(logger.error);

    browser.storage.local.get("loglevel").then(({ loglevel }) => {
      if (logLevel !== undefined) {
        logLevel = loglevel;
      }
    });
  });
</script>

<section class="grid">
  <h1>Debug</h1>
  {#each Object.keys(storage) as (keyof typeof storage)[] as key}
    <Card>
      <h2>{storage[key].title}</h2>
      {#if !!storage[key].error}
        <p class="error">{storage[key].error}</p>
      {:else}
        {@html storage[key].values}
      {/if}
    </Card>
  {/each}
  <Card>
    <h2>Set log level</h2>
    <!-- svelte-ignore a11y-no-onchange -->
    <select onchange={setLogLevel} value={logLevel}>
      <option value="0">None</option>
      <option value="1">Error</option>
      <option value="2">Warning</option>
      <option value="3">Info</option>
      <option value="4">Log</option>
      <option value="5">Debug</option>
      <option value="6">All</option>
    </select>
    <h2>Test messages/loading</h2>
    <button onclick={toggleLoading} class="primary">Toggle loading</button>
    <button onclick={addInfo} class="accent">Add info message</button>
    <button onclick={addWarning} class="warning">Add warning message</button>
    <button onclick={addError} class="danger">Add error message</button>
  </Card>
</section>

<style>
  section :global(.entry) {
    margin-left: var(--spacing);
  }

  section :global(em) {
    color: var(--color-primary-light);
  }
</style>
