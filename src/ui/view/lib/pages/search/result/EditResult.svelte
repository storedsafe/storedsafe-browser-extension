<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { getMessage, LocalizedMessage } from "../../../../../../global/i18n";
  import { search } from "../../../../../stores";
  import { followFocus } from "../../../../use/followFocus";

  import Card from "../../../layout/Card.svelte";

  const dispatch = createEventDispatcher();

  export let result: StoredSafeObject;

  const editValues: Record<string, string> = Object.fromEntries(
    result.fields.map(({ name, value }) => [name, value])
  );
  $: changedValues = Object.fromEntries(
    Object.keys(editValues)
      .map((field) => {
        const resultfield = result.fields.find(({ name }) => name === field);
        if (resultfield.value !== editValues[field]) {
          return [field, editValues[field]];
        } else {
          return [field, null];
        }
      })
      .filter(([_field, value]) => value !== null)
  );
  $: hasChanges = Object.keys(changedValues).length > 0;

  const cancel = (): void => dispatch("set-edit", false);

  function editObject(): void {
    search.edit(result.host, result.id, changedValues).then(() => {
      cancel();
    });
  }
</script>

<style>
  .changed {
    border-color: var(--color-warning);
  }
</style>

<form class="grid" use:followFocus on:submit|preventDefault={editObject}>
  <Card>
    {#each result.fields as field (field.name)}
      <article class="grid">
        <span class="subtitle">{field.title}</span>
        <input
          class:changed={!!changedValues[field.name]}
          type="text"
          bind:value={editValues[field.name]} />
      </article>
    {/each}
  </Card>
  <div class="sticky-buttons">
    <button type="submit" disabled={!hasChanges}>
      {getMessage(LocalizedMessage.SEARCH_RESULT_SAVE)}
    </button>
    <button type="button" class="danger" on:click={cancel}>
      {getMessage(LocalizedMessage.SEARCH_RESULT_CANCEL_EDIT)}
    </button>
  </div>
</form>
