<script lang="ts" context="module">
  export const addRequirements = [
    SESSIONS_LOGIN_LOADING_ID,
    SESSIONS_LOGOUT_LOADING_ID,
    STRUCTURE_REFRESH_LOADING_ID,
  ];
</script>

<script lang="ts">
  import { afterUpdate } from "svelte";

  import { vault } from "../../../../../global/api";
  import { getMessage, LocalizedMessage } from "../../../../../global/i18n";
  import {
    preferences,
    sessions,
    structure,
    SESSIONS_LOGIN_LOADING_ID,
    SESSIONS_LOGOUT_LOADING_ID,
    STRUCTURE_REFRESH_LOADING_ID,
    loading,
    MessageType,
    Duration,
    messages,
  } from "../../../../stores";

  import Card from "../../layout/Card.svelte";
  import PasswordInput from "../../layout/PasswordInput.svelte";
  import AddField from "./AddField.svelte";

  export let defaultValues: Record<string, any> = {};

  let prevHost: string = null;
  let host: string =
    $preferences.add?.lastHost ?? $structure.keys().next().value;
  const values: Record<string, any> = {
    parentid: "0",
    groupid: $preferences.add?.hosts[host] ?? $structure.get(host).vaults[0].id,
    templateid: $structure.get(host).templates.find(({ id }) => id === "20")
      ? "20"
      : $structure.get(host).templates[0].id,
  };
  let templateValues: Record<string, any> = {
    ...defaultValues,
  };

  let selectedTemplate: StoredSafeTemplate;
  $: selectedTemplate = $structure
    .get(host)
    .templates.find(({ id }) => id === values.templateid);

  let policy: StoredSafePasswordPolicy;
  $: {
    const policyId = $structure.get(host).vaults.find(({ id }) => id === values.groupid)?.policyId;
    policy = $structure.get(host).policies.find(({ id }) => id === policyId)
  }

  function add() {
    for (const key of Object.keys(templateValues)) {
      if (
        selectedTemplate.structure.findIndex(({ name }) => name === key) !== -1
      ) {
        values[key] = templateValues[key];
      }
    }
    loading.add(
      `Add.add`,
      vault.addObject(host, $sessions.get(host).token, values),
      {
        onError(error) {
          messages.add(error.message, MessageType.ERROR);
        },
        onSuccess() {
          templateValues = {};
          messages.add(
            getMessage(LocalizedMessage.ADD_SUCCESS),
            MessageType.INFO,
            Duration.MEDIUM
          );
          preferences
            .setAddPreferences(host, values.groupid)
            .catch(console.error);
        },
      }
    );
  }

  $: validated = selectedTemplate.structure
    .map(({ name, required }) => {
      const value = templateValues[name];
      let isValidated: boolean = true;
      if (required) {
        if (typeof value === "string") {
          isValidated = value?.length > 0;
        } else {
          isValidated = value !== undefined;
        }
      }
      return isValidated;
    })
    .reduce(
      (isValidated, fieldValidated) => isValidated && fieldValidated,
      true
    );

  afterUpdate(() => {
    if (prevHost !== host) {
      prevHost = host;
      values.groupid =
        $preferences.add?.hosts[host] ?? $structure.get(host).vaults[0].id;
      if (
        !$structure
          .get(host)
          .templates.findIndex(({ id }) => id === values.templateid)
      ) {
        values.templateid = $structure
          .get(host)
          .templates.find(({ id }) => id === "20")
          ? "20"
          : $structure.get(host).templates[0].id;
      }
    }
  });
</script>

<style>

</style>

<section>
  <form class="grid" on:submit|preventDefault={add}>
    <Card>
      <!-- StoredSafe Host -->
      <label for="host">
        {getMessage(LocalizedMessage.ADD_HOST)}
        <select id="host" bind:value={host}>
          {#each [...$structure.keys()] as host (host)}
            <option value={host}>{host}</option>
          {/each}
        </select>
      </label>
    </Card>
    <Card>
      <!-- StoredSafe Vault -->
      <label for="vault">
        {getMessage(LocalizedMessage.ADD_VAULT)}
        <select id="vault" bind:value={values.groupid}>
          {#each $structure.get(host).vaults as vault (vault.id)}
            <option value={vault.id}>{vault.name}</option>
          {/each}
        </select>
      </label>
      <!-- StoredSafe Template -->
      <label for="templates">
        {getMessage(LocalizedMessage.ADD_TEMPLATE)}
        <select id="templates" bind:value={values.templateid}>
          {#each $structure.get(host).templates as template (template.id)}
            <option value={template.id}>{template.name}</option>
          {/each}
        </select>
      </label>
    </Card>
    <Card>
      {#each selectedTemplate.structure as field (host + values.templateid + field.name)}
        <!-- StoredSafe Template -->
        {#if field.pwgen}
          <PasswordInput
            {field}
            bind:value={templateValues[field.name]}
            {host}
            {policy} />
        {:else}
          <AddField {field} bind:value={templateValues[field.name]} />
        {/if}
      {/each}
    </Card>
    <!-- Submit form to add object to StoredSafe -->
    <div class="sticky-buttons">
      <button type="submit" disabled={!validated}>
        {getMessage(LocalizedMessage.ADD_CREATE)}
      </button>
    </div>
  </form>
</section>
