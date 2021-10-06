<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { getMessage, LocalizedMessage } from "../../../../../../global/i18n";
  import {
    Duration,
    loading,
    messages,
    MessageType,
    search,
    SEARCH_EDIT_LOADING_ID,
  } from "../../../../../stores";
  import { followFocus } from "../../../../use/followFocus";
  import Card from "../../../layout/Card.svelte";
  import TemplateFields from "../../add/TemplateFields.svelte";

  const dispatch = createEventDispatcher();
  let isValid: boolean = false;

  export let result: StoredSafeObject;

  let editValues: Record<string, string> = Object.fromEntries(
    result.fields.map(({ name, value }) => [name, value])
  );

  const cancel = (): void => dispatch("set-edit", false);

  function editObject(): void {
    loading.add(
      `${SEARCH_EDIT_LOADING_ID}.${result.id}`,
      search.edit(result, editValues),
      {
        onError(error) {
          messages.add(error.message, MessageType.ERROR, Duration.LONG);
        },
        onSuccess() {
          cancel();
        },
      }
    );
  }
</script>

<form class="grid" use:followFocus on:submit|preventDefault={editObject}>
  <Card>
    <TemplateFields
      host={result.host}
      groupid={result.vaultId}
      templateid={result.templateId}
      bind:values={editValues}
      edit={true}
      on:validate={(e) => (isValid = e.detail)}
    />
  </Card>
  <div class="sticky-buttons">
    <button type="submit" disabled={!isValid}>
      {getMessage(LocalizedMessage.SEARCH_RESULT_SAVE)}
    </button>
    <button type="button" class="danger" on:click={cancel}>
      {getMessage(LocalizedMessage.SEARCH_RESULT_CANCEL_EDIT)}
    </button>
  </div>
</form>
