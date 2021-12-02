<script lang="ts" context="module">
  import { Logger } from "../../../../../global/logger";
  const logger = new Logger("generalsettings");
</script>

<script lang="ts">
  import { onDestroy } from "svelte";

  import { getMessage, LocalizedMessage } from "../../../../../global/i18n";
  import {
    FIELDS,
    SettingsField,
    SettingsFields,
  } from "../../../../../global/storage/settings";
  import {
    Duration,
    loading,
    messageStore,
    MessageType,
    settings,
    SETTINGS_UPDATE_LOADING_ID,
  } from "../../../../stores";

  import Card from "../../layout/Card.svelte";
  import MessageViewer from "../../layout/MessageViewer.svelte";
  import Toggle from "../../layout/Toggle.svelte";

  const settingsMessages = messageStore();

  let managedFields: [SettingsFields, SettingsField, any][];
  let userFields: [SettingsFields, SettingsField, any][];
  const unsubscribeSettings = settings.subscribe((newSettings) => {
    managedFields = [];
    userFields = [];
    for (const [key, field] of FIELDS) {
      const setting = newSettings.get(key);
      if (!setting) logger.error(`Field ${key} not in settings.`);
      else {
        // Set up fields
        if (setting.managed)
          managedFields.push([key, { ...field }, setting.value]);
        else {
          userFields.push([key, { ...field }, setting.value]);
        }
      }
    }
  });

  $: altered = new Map(
    userFields.map(([key, _field, value]) => [
      key,
      value !== $settings.get(key).value,
    ])
  );
  $: isAltered = [...altered.values()].reduce(
    (hasAltered, keyAltered) => hasAltered || keyAltered,
    false
  );

  function updateSettings(): void {
    settingsMessages.clear();
    const newSettings: [string, any][] = userFields
      .filter(([key]) => altered.get(key))
      .map(([key, _field, value]) => [key, value]);
    loading.add(SETTINGS_UPDATE_LOADING_ID, settings.set(...newSettings), {
      onSuccess() {
        settingsMessages.add(
          getMessage(LocalizedMessage.SETTINGS_USER_UPDATE_SUCCESS),
          MessageType.INFO,
          Duration.SHORT
        );
      },
      onError(error) {
        settingsMessages.add(error.message, MessageType.ERROR);
      },
    });
  }

  onDestroy(() => {
    unsubscribeSettings();
  });
</script>

<section class="grid">
  <form class="site-entry" on:submit|preventDefault={updateSettings}>
    <Card>
      <h2 title={getMessage(LocalizedMessage.SETTINGS_USER_TITLE)}>
        {getMessage(LocalizedMessage.SETTINGS_USER_HEADER)}
      </h2>
      {#if userFields.length === 0}
        {getMessage(LocalizedMessage.SETTINGS_USER_ALL_LOCKED)}
      {/if}
      <div>
        {#each userFields as [key, field, value] (key)}
          <label for={key} class:label-inline={!!field.isCheckbox}>
            <span
              title={field.title ?? ""}
              class:altered={field.isCheckbox && altered.get(key)}
            >
              {field.label}
            </span>
            {#if !!field.isCheckbox}
              <Toggle
                {...field.attributes}
                id={key}
                altered={altered.get(key)}
                bind:checked={value}
              />
            {:else}
              <div class="user-input">
                <input
                  {...field.attributes}
                  type="number"
                  id={key}
                  class:altered={altered.get(key)}
                  bind:value
                  required
                />
                {#if !!field.unit}<span class="unit">{field.unit}</span>{/if}
              </div>
            {/if}
          </label>
        {/each}
      </div>
      {#if userFields.length > 0}
        <button type="submit" disabled={!isAltered}>
          {getMessage(LocalizedMessage.SETTINGS_USER_UPDATE)}
        </button>
        <MessageViewer messages={settingsMessages} />
      {/if}
    </Card>
  </form>
  {#if managedFields.length > 0}
    <Card>
      <h2 title={getMessage(LocalizedMessage.SETTINGS_MANAGED_TITLE)}>
        {getMessage(LocalizedMessage.SETTINGS_MANAGED_HEADER)}
      </h2>
      <div>
        {#each managedFields as [key, field, value] (key)}
          <label for={key} class:label-inline={!!field.isCheckbox}>
            <span
              title={field.title ?? ""}
              class:altered={field.isCheckbox && altered.get(key)}
            >
              {field.label}
            </span>
            {#if !!field.isCheckbox}
              <Toggle
                {...field.attributes}
                id={key}
                altered={altered.get(key)}
                bind:checked={value}
                disabled={true}
              />
            {:else}
              <div class="user-input">
                <input
                  {...field.attributes}
                  type="number"
                  id={key}
                  class:altered={altered.get(key)}
                  bind:value
                  disabled={true}
                  required
                />
                {#if !!field.unit}<span class="unit">{field.unit}</span>{/if}
              </div>
            {/if}
          </label>
        {/each}
      </div>
    </Card>
  {/if}
</section>

<style>
  label {
    padding: var(--spacing);
    border-bottom: 1px solid var(--color-input-fg-disabled);
  }

  label:last-child {
    border-bottom: 0;
  }
  .label-inline {
    flex-direction: row;
    justify-content: space-between;
  }

  .altered {
    border-color: var(--color-warning);
  }

  span.altered {
    border-bottom-width: 2px;
    border-bottom-style: solid;
    box-sizing: border-box;
  }

  .user-input {
    display: grid;
    grid-template-columns: 1fr auto;
    column-gap: var(--spacing);
    align-items: center;
  }

  .managed-field-value {
    font-weight: bold;
  }
</style>
