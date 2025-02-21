<script lang="ts" module>
  import { Logger } from "@/global/logger";
  const logger = new Logger("generalsettings");
</script>

<script lang="ts">
  import { getMessage, LocalizedMessage } from "@/global/i18n";
  import type {
    SettingsField,
    SettingsFields,
  } from "@/global/storage/settings";
  import { FIELDS } from "@/global/storage/settings";
  import {
    Duration,
    loading,
    Messages,
    MessageType,
    settings,
    SETTINGS_UPDATE_LOADING_ID,
  } from "@/ui/stores";

  import Card from "@/ui/view/lib/layout/Card.svelte";
  import MessageViewer from "@/ui/view/lib/layout/MessageViewer.svelte";
  import Toggle from "@/ui/view/lib/layout/Toggle.svelte";

  const settingsMessages = new Messages();

  const KEY_INDEX = 0;
  const FIELD_INDEX = 1;
  const VALUE_INDEX = 2;

  let managedFields: [SettingsFields, SettingsField, any][] = $state([]);
  let userFields: [SettingsFields, SettingsField, any][] = $state([]);
  $effect(() => {
    const newManagedFields: [SettingsFields, SettingsField, any][] = [];
    const newUserFields: [SettingsFields, SettingsField, any][] = [];
    for (const [key, field] of FIELDS) {
      const setting = settings.data.get(key);
      if (!setting) logger.error(`Field ${key} not in settings.`);
      else {
        // Set up fields
        if (setting.managed)
          newManagedFields.push([key, { ...field }, setting.value]);
        else {
          newUserFields.push([key, { ...field }, setting.value]);
        }
      }
    }
    managedFields = newManagedFields;
    userFields = newUserFields;
  });

  let alteredFields = $derived(
    new Map(
      userFields.map(([key, _field, value]) => [
        key,
        value !== settings.data.get(key)?.value,
      ])
    )
  );

  let isAltered: boolean = $derived(
    [...alteredFields.values()].reduce(
      (hasAltered, keyAltered) => hasAltered || keyAltered,
      false
    )
  );

  function updateSettings(e: SubmitEvent): void {
    e.preventDefault();
    settingsMessages.clear();
    const newSettings: [string, any][] = userFields
      .filter(([key]) => alteredFields.get(key))
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
</script>

<section class="grid">
  <form class="site-entry" onsubmit={updateSettings}>
    <Card>
      <h2 title={getMessage(LocalizedMessage.SETTINGS_USER_TITLE)}>
        {getMessage(LocalizedMessage.SETTINGS_USER_HEADER)}
      </h2>
      {#if userFields.length === 0}
        {getMessage(LocalizedMessage.SETTINGS_USER_ALL_LOCKED)}
      {/if}
      <div>
        {#each userFields as field (field[KEY_INDEX])}
          <label
            for={field[KEY_INDEX]}
            class:label-inline={!!field[FIELD_INDEX].isCheckbox}
          >
            <span
              title={field[FIELD_INDEX].title ?? ""}
              class:altered={field[FIELD_INDEX].isCheckbox &&
                alteredFields.get(field[KEY_INDEX])}
            >
              {field[FIELD_INDEX].label}
            </span>
            {#if !!field[FIELD_INDEX].isCheckbox}
              <Toggle
                {...field[FIELD_INDEX].attributes}
                id={field[KEY_INDEX]}
                altered={alteredFields.get(field[KEY_INDEX]) ?? false}
                bind:checked={field[VALUE_INDEX]}
              />
            {:else}
              <div class="user-input">
                <input
                  {...field[FIELD_INDEX].attributes}
                  type="number"
                  id={field[KEY_INDEX]}
                  class:altered={alteredFields.get(field[KEY_INDEX])}
                  bind:value={field[VALUE_INDEX]}
                  required
                />
                {#if !!field[FIELD_INDEX].unit}<span class="unit"
                    >{field[FIELD_INDEX].unit}</span
                  >{/if}
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
        {#each managedFields as field (field[KEY_INDEX])}
          <label
            for={field[KEY_INDEX]}
            class:label-inline={!!field[FIELD_INDEX].isCheckbox}
          >
            <span
              title={field[FIELD_INDEX].title ?? ""}
              class:altered={field[FIELD_INDEX].isCheckbox &&
                alteredFields.get(field[KEY_INDEX])}
            >
              {field[FIELD_INDEX].label}
            </span>
            {#if !!field[FIELD_INDEX].isCheckbox}
              <Toggle
                {...field[FIELD_INDEX].attributes}
                id={field[KEY_INDEX]}
                altered={alteredFields.get(field[KEY_INDEX])}
                bind:checked={field[VALUE_INDEX]}
                disabled={true}
              />
            {:else}
              <div class="user-input">
                <input
                  {...field[FIELD_INDEX].attributes}
                  type="number"
                  id={field[KEY_INDEX]}
                  class:altered={alteredFields.get(field[KEY_INDEX])}
                  bind:value={field[VALUE_INDEX]}
                  disabled={true}
                  required
                />
                {#if !!field[FIELD_INDEX].unit}<span class="unit"
                    >{field[FIELD_INDEX].unit}</span
                  >{/if}
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
