<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import {
    Duration,
    loading,
    messages,
    MessageType,
    search,
    SEARCH_DELETE_LOADING_ID,
    structure,
  } from "../../../../../stores";
  import { getMessage, LocalizedMessage } from "../../../../../../global/i18n";

  import ConfirmDialog from "../../../layout/ConfirmDialog.svelte";
  import Field from "../fields/Field.svelte";

  export let result: StoredSafeObject;

  const dispatch = createEventDispatcher();
  let confirmDelete = false;

  $: vault = $structure
    .get(result.host)
    .vaults.find(({ id }) => id === result.vaultId);
  $: isFillable = result.fields.findIndex((field) => field.isPassword) !== -1;

  function setEdit () {
    const exec = () => dispatch("set-edit", true);
    const hasEncrypted = !!result.fields.find(field => field.isEncrypted)
    if (!result.isDecrypted && hasEncrypted) {
      loading.add(`ViewResult.setEdit`, search.decrypt(result), {
        onSuccess: exec,
        onError: (error) => {
          messages.add(error.message, MessageType.ERROR)
        }
      })
    } else {
      exec()
    }
  }

  function fill() {
    browser.runtime.sendMessage({
      context: "fill",
      action: "fill",
      data: result,
    });
    window.close();
  }

  function setConfirmDelete(value: boolean) {
    confirmDelete = value;
  }

  function deleteObject() {
    loading.add(
      `${SEARCH_DELETE_LOADING_ID}.${result.id}`,
      search.delete(result),
      {
        onError(error) {
          messages.add(error.message, MessageType.ERROR, Duration.MEDIUM);
        },
        onSuccess() {
          setConfirmDelete(false);
        },
      }
    );
  }

  async function decryptField(field: string): Promise<string> {
    const exec = (decrypted: StoredSafeObject): string =>
      decrypted.fields.find(({ name }) => name === field).value;
    if (result.isDecrypted) return await Promise.resolve(exec(result));
    return await search.decrypt(result).then(exec);
  }
</script>

<section class="grid">
  {#if isFillable}
    <button type="button" on:click={fill}>
      {getMessage(LocalizedMessage.SEARCH_RESULT_FILL)}
    </button>
  {/if}
  {#each result.fields as field (field.name)}
    <Field {field} decrypt={() => decryptField(field.name)} />
  {/each}
</section>

{#if vault.permissions >= 2}
  <div class="sticky-buttons">
    <button
      disabled={vault.permissions < 2}
      type="button"
      class="warning"
      on:click={setEdit}>
      {getMessage(LocalizedMessage.SEARCH_RESULT_EDIT)}
    </button>
    <button
      disabled={vault.permissions < 2}
      type="button"
      class="danger"
      on:click={() => setConfirmDelete(true)}>
      {getMessage(LocalizedMessage.SEARCH_RESULT_DELETE)}
    </button>
  </div>
{/if}

{#if confirmDelete}
  <ConfirmDialog
    on:close={() => setConfirmDelete(false)}
    on:confirm={deleteObject}>
    {getMessage(LocalizedMessage.SEARCH_RESULT_CONFIRM_DELETE)}
  </ConfirmDialog>
{/if}
