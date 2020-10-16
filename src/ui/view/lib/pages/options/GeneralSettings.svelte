<script lang="ts">
  import { onDestroy } from "svelte";

  import { getMessage, LocalizedMessage } from "../../../../../global/i18n";
  import {
    FIELDS,
    SettingsField,
    SettingsFields,
  } from "../../../../../global/storage/settings";
  import {
    loading,
    messageStore,
    MessageType,
    settings,
  } from "../../../../stores";

  import Card from "../../layout/Card.svelte";
  import MessageViewer from "../../layout/MessageViewer.svelte";

  const settingsMessages = messageStore();

  let managedFields: [SettingsFields, SettingsField, any][];
  let userFields: [SettingsFields, SettingsField, any][];
  const unsubscribeSettings = settings.subscribe((newSettings) => {
    managedFields = [];
    userFields = [];
    for (const [key, field] of FIELDS) {
      const setting = newSettings.get(key);
      if (!setting) console.error(`Field ${key} not in settings.`);
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
    loading.add(`GeneralSettings.update`, settings.set(...newSettings), {
      onError(error) {
        settingsMessages.add(error.message, MessageType.ERROR);
      },
    });
  }

  onDestroy(() => {
    unsubscribeSettings();
  });
</script>

<style>
  .label-inline {
    flex-direction: row-reverse;
    justify-content: flex-end;
  }

  .altered {
    border-color: var(--color-warning);
  }

  span.altered {
    border-bottom-width: 2px;
    border-bottom-style: solid;
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

<section class="grid">
  <form class="site-entry" on:submit|preventDefault={updateSettings}>
    <Card>
      <h2 title={getMessage(LocalizedMessage.SETTINGS_USER_TITLE)}>
        {getMessage(LocalizedMessage.SETTINGS_USER_HEADER)}
      </h2>
      {#if userFields.length === 0}
        {getMessage(LocalizedMessage.SETTINGS_USER_ALL_LOCKED)}
      {/if}
      {#each userFields as [key, field, value] (key)}
        <label for={key} class:label-inline={!!field.isCheckbox}>
          <span
            title={field.title ?? ''}
            class:altered={field.isCheckbox && altered.get(key)}>
            {field.label}
          </span>
          {#if !!field.isCheckbox}
            <input
              {...field.attributes}
              type="checkbox"
              id={key}
              class:altered={altered.get(key)}
              bind:checked={value} />
          {:else}
            <div class="user-input">
              <input
                {...field.attributes}
                type="number"
                id={key}
                class:altered={altered.get(key)}
                bind:value
                required />
              {#if !!field.unit}<span class="unit">{field.unit}</span>{/if}
            </div>
          {/if}
        </label>
      {/each}
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
      {#each managedFields as [key, field, value] (field.label)}
        <div class="managed-field">
          <span>{field.label}</span>
          <span class="managed-field-value">
            {field.isCheckbox ? (value ? getMessage(LocalizedMessage.SETTINGS_MANAGED_TRUE) : getMessage(LocalizedMessage.SETTINGS_MANAGED_FALSE)) : value}
          </span>
          {#if !!field.unit}<span class="unit">{field.unit}</span>{/if}
        </div>
      {/each}
    </Card>
  {/if}
</section>
