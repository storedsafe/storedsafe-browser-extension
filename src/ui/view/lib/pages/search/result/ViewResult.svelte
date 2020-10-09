<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { search, structure } from "../../../../../stores";
  import { getMessage, LocalizedMessage } from "../../../../../../global/i18n";

  import ConfirmDialog from "../../../layout/ConfirmDialog.svelte";
  import Field from "../fields/Field.svelte";

  export let result: StoredSafeObject;

  const dispatch = createEventDispatcher();
  let confirmDelete = false;

  $: vault = $structure
    .get(result.host)
    .vaults.find(({ id }) => id === result.vaultId);

  const setEdit = () => dispatch("set-edit", true);

  function fill() {
    console.log("FILL");
  }

  function setConfirmDelete(value: boolean) {
    confirmDelete = value;
  }

  function deleteObject() {
    search.delete(result.host, result.id);
  }

  async function decrypt(field: string): Promise<string> {
    const exec = (decrypted: StoredSafeObject): string =>
      decrypted.fields.find(({ name }) => name === field).value;
    if (result.isDecrypted) return await Promise.resolve(exec(result));
    return await search.decrypt(result.host, result.id).then(exec);
  }
</script>

<section class="grid">
  <button type="button" on:click={fill}>
    {getMessage(LocalizedMessage.SEARCH_RESULT_FILL)}
  </button>
  {#each result.fields as field (field.name)}
    <Field {field} decrypt={() => decrypt(field.name)} />
  {/each}
</section>

{#if vault.permissions >= 1}
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