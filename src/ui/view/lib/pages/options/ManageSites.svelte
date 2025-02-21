<script lang="ts">
  import { getMessage, LocalizedMessage } from "@/global/i18n";
  import {
    loading,
    Messages,
    MessageType,
    sites,
    SITES_ADD_LOADING_ID,
    SITES_REMOVE_LOADING_ID,
  } from "@/ui/stores";

  import Card from "@/ui/view/lib/layout/Card.svelte";
  import MessageViewer from "@/ui/view/lib/layout/MessageViewer.svelte";

  let addHost: HTMLInputElement | undefined = $state();

  const addInitialState = { host: "", apikey: "" };
  let addValues: Pick<Site, "host" | "apikey"> = $state(
    structuredClone(addInitialState)
  );

  const addMessages = new Messages();
  const deleteMessages = new Messages();

  let managedSites: Site[] = $derived(
    sites.data.filter((site) => site.managed)
  );
  let userSites: Site[] = $derived(sites.data.filter((site) => !site.managed));

  function resetAddForm() {
    addValues = structuredClone(addInitialState);
    addHost?.focus();
  }

  function addSite(e: SubmitEvent): void {
    e.preventDefault();
    addMessages.clear();
    const { host, apikey } = addValues;
    loading.add(SITES_ADD_LOADING_ID, sites.add(host, apikey), {
      onSuccess() {
        resetAddForm();
      },
      onError(error) {
        addMessages.add(error.message, MessageType.ERROR);
      },
    });
  }

  function removeSite(e: SubmitEvent, host: string): void {
    e.preventDefault();
    loading.add(SITES_REMOVE_LOADING_ID, sites.remove(host), {
      onError(error) {
        deleteMessages.add(error.message, MessageType.ERROR);
      },
    });
  }
</script>

<section class="grid">
  <form class="grid" onsubmit={addSite}>
    <Card>
      <h2>{getMessage(LocalizedMessage.OPTIONS_SITES_ADD_HEADER)}</h2>
      <label for="host">
        {getMessage(LocalizedMessage.OPTIONS_SITES_ADD_LABEL_HOST)}
        <input
          type="text"
          id="host"
          placeholder="myvault.storedsafe.com"
          bind:this={addHost}
          bind:value={addValues.host}
          oninput={() => addMessages.clear()}
          required
        />
      </label>
      <label>
        {getMessage(LocalizedMessage.OPTIONS_SITES_ADD_LABEL_APIKEY)}
        <input
          type="password"
          id="apikey"
          placeholder="abcde12345"
          bind:value={addValues.apikey}
          oninput={() => addMessages.clear()}
          required
        />
      </label>
      <button type="submit">
        {getMessage(LocalizedMessage.OPTIONS_SITES_ADD)}
      </button>
      <MessageViewer messages={addMessages} />
    </Card>
  </form>

  {#if userSites.length > 0}
    <Card>
      <h2 title={getMessage(LocalizedMessage.OPTIONS_SITES_USER_TITLE)}>
        {getMessage(LocalizedMessage.OPTIONS_SITES_USER_HEADER)}
      </h2>
      {#each userSites as site (site.host)}
        <form class="site-entry" onsubmit={(e) => removeSite(e, site.host)}>
          <span>{site.host}</span>
          <button type="submit" class="danger">
            {getMessage(LocalizedMessage.OPTIONS_SITES_DELETE)}
          </button>
        </form>
      {/each}
      <MessageViewer messages={deleteMessages} />
    </Card>
  {/if}

  {#if managedSites.length > 0}
    <Card>
      <h2 title={getMessage(LocalizedMessage.OPTIONS_SITES_MANAGED_TITLE)}>
        {getMessage(LocalizedMessage.OPTIONS_SITES_MANAGED_HEADER)}
      </h2>
      {#each managedSites as site (site.host)}
        <div class="site-entry"><span>{site.host}</span></div>
      {/each}
    </Card>
  {/if}
</section>

<style>
  .site-entry {
    background-color: var(--color-input-bg);
    border-radius: var(--border-radius);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .site-entry span {
    padding: var(--spacing);
  }
</style>
