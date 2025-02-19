<script lang="ts">
  import EditResult from "./result/EditResult.svelte";
  import ViewResult from "./result/ViewResult.svelte";

  export let result: StoredSafeObject;
  let edit: boolean = false;

  function setEdit(value: boolean): void {
    edit = value;
  }
</script>

<article>
  {#if edit}
    <EditResult {result} onSetEdit={setEdit} />
  {:else}
    <ViewResult {result} onSetEdit={setEdit} />
  {/if}
</article>

<style>
  article {
    position: relative;
  }
</style>
