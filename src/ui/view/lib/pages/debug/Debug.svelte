<script lang="ts" context="module">
  import { Logger } from "../../../../../global/logger";
  const logger = new Logger("debug");
</script>

<script lang="ts">
  import { onMount } from "svelte";

  import { loading, messages, MessageType } from "../../../../stores";

  import Card from "../../layout/Card.svelte";

  const addError = () => messages.add("Debug error message", MessageType.ERROR);
  const addWarning = () =>
    messages.add("Debug warning message", MessageType.WARNING);
  const addInfo = () => messages.add("Debug info message", MessageType.INFO);
  let resolveLoading: (value: any) => void = null;
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
    for (const key of Object.keys(storage)) {
      try {
        storage[key].values = parseStorage(await browser.storage[key].get());
        storage[key].error = null;
      } catch (error) {
        storage[key].error = error.toString();
      }
    }
  }

  onMount(() => {
    getStorage()
      .then(() => {})
      .catch((error) => {
        logger.error(error);
      });
  });
</script>

<section class="grid">
  <h1>Debug</h1>
  {#each Object.keys(storage) as key}
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
    <h2>Test messages/loading</h2>
    <button on:click={toggleLoading} class="primary">Toggle loading</button>
    <button on:click={addInfo} class="accent">Add info message</button>
    <button on:click={addWarning} class="warning">Add warning message</button>
    <button on:click={addError} class="danger">Add error message</button>
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
