<script lang="ts" context="module">
  export const addRequirements = [
    SESSIONS_LOGIN_LOADING_ID,
    SESSIONS_LOGOUT_LOADING_ID,
    STRUCTURE_REFRESH_LOADING_ID,
  ];
</script>

<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";

  import { getMessage, LocalizedMessage } from "../../../../../global/i18n";
  import {
    SESSIONS_LOGIN_LOADING_ID,
    SESSIONS_LOGOUT_LOADING_ID,
    structure,
    STRUCTURE_REFRESH_LOADING_ID,
  } from "../../../../stores";
  import { followFocus } from "../../../use/followFocus";

  import Card from "../../layout/Card.svelte";
  import PasswordInput from "../../layout/PasswordInput.svelte";

  /** The StoredSafe host to be selected by default. */
  export let defaultHost: string = null;
  /** The StoredSafe ID of the StoredSafe vault to be selected by default. */
  export let defaultHostVaults: Map<string, string> = new Map();
  /** The StoredSafe ID of the StoredSafe template to be selected by default. */
  export let defaultHostTemplates: Map<string, string> = new Map();
  /** Default field values, if external form data should be preloaded. */
  export let defaultValues: Record<string, string> = {};

  let hosts: string[];
  let vaults: StoredSafeVault[];
  let templates: StoredSafeTemplate[];
  let selectedHost = defaultHost;

  $: {
    hosts = [...$structure.keys()];
    vaults = !!selectedHost ? $structure.get(selectedHost).vaults : [];
    templates = !!selectedHost ? $structure.get(selectedHost).templates : [];
  }

  /** Form values */
  let values: Record<string, string> = {
    parentid: "0",
    ...defaultValues,
  };

  $: fields = templates.find((template) => template.id === values.templateid)
    ?.structure;

  const dispatch = createEventDispatcher();
  /** Add object to StoredSafe. */
  const add = () => dispatch("add", values);

  onMount(() => {
    selectedHost = selectedHost ?? hosts[0];
    values.groupid = defaultHostVaults.get(selectedHost) ?? vaults[0]?.id;
    values.templateid =
      defaultHostTemplates.get(selectedHost) ?? templates[0]?.id;
  });
</script>

<style>

</style>

<section>
  <form class="grid" on:submit|preventDefault={add} use:followFocus>
    <Card>
      <!-- StoredSafe Host -->
      <label for="host">
        {getMessage(LocalizedMessage.ADD_HOST)}
        <select id="host" bind:value={selectedHost}>
          {#each hosts as host (host)}
            <option value={host}>{host}</option>
          {/each}
        </select>
      </label>
    </Card>
    {#if !!selectedHost && !!vaults && !!templates}
      <Card>
        <!-- StoredSafe Vault -->
        <label for="vault">
          {getMessage(LocalizedMessage.ADD_VAULT)}
          <select id="vault" bind:value={values.groupid}>
            {#each vaults as vault (vault.id)}
              <option value={vault.id}>{vault.name}</option>
            {/each}
          </select>
        </label>
        <!-- StoredSafe Template -->
        <label for="template">
          {getMessage(LocalizedMessage.ADD_TEMPLATE)}
          <select id="template" bind:value={values.templateid}>
            {#each templates as template (template.id)}
              <option value={template.id}>{template.name}</option>
            {/each}
          </select>
        </label>
      </Card>
    {/if}
    {#if !!values.templateid && !!templates}
      <!-- Generated fields based on the selected template -->
      <Card>
        {#each fields as field (field.name)}
          <label for={field.name}>
            {field.title}
            {#if field.type === 'password'}
              <PasswordInput name={field.name} id={field.name} />
            {:else}
              <input type={field.type} name={field.name} id={field.name} />
            {/if}
          </label>
        {/each}
      </Card>
    {/if}
    <!-- Submit form to add object to StoredSafe -->
    <div class="sticky-buttons">
      <button
        type="button"
        disabled={!!values.host && !!values.templateid && !!values.vaultid}>
        {getMessage(LocalizedMessage.ADD_CREATE)}
      </button>
    </div>
  </form>
</section>
