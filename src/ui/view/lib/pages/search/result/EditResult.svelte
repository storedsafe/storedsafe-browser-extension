<script lang="ts" module>
  interface Props {
    result: StoredSafeObject;
    onSetEdit: (edit: boolean) => void;
  }
</script>

<script lang="ts">
  import { getMessage, LocalizedMessage } from "@/global/i18n";
  import {
    Duration,
    loading,
    messages,
    MessageType,
    search,
    SEARCH_EDIT_LOADING_ID,
  } from "@/ui/stores";
  import Card from "@/ui/view/lib/layout/Card.svelte";
  import TemplateFields from "@/ui/view/lib/pages/add/TemplateFields.svelte";

  let { result, onSetEdit }: Props = $props();

  let isValid: boolean = $state(false);

  let editValues: Record<string, string> = $state(
    Object.fromEntries(
      result.fields.map(({ name, value }) => [name, value])
    ) as Record<string, string>
  );

  const cancel = (): void => onSetEdit(false);

  function editObject(e: SubmitEvent): void {
    e.preventDefault();
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

<form class="grid" onsubmit={editObject}>
  <Card>
    <TemplateFields
      host={result.host}
      groupid={result.vaultId}
      templateid={result.templateId}
      bind:values={editValues}
      edit={true}
      onValidate={(valid) => (isValid = valid)}
    />
  </Card>
  <div class="sticky-buttons">
    <button type="submit" disabled={!isValid}>
      {getMessage(LocalizedMessage.SEARCH_RESULT_SAVE)}
    </button>
    <button type="button" class="danger" onclick={() => cancel()}>
      {getMessage(LocalizedMessage.SEARCH_RESULT_CANCEL_EDIT)}
    </button>
  </div>
</form>
