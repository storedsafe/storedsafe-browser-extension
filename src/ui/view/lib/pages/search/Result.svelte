<script lang="ts">
  import EditResult from "./result/EditResult.svelte";
  import ViewResult from "./result/ViewResult.svelte";

  export let result: StoredSafeObject;
  let edit: boolean = false;

  function setEdit(e: CustomEvent<boolean>): void {
    edit = e.detail;
  }
</script>

<style>
  article {
    position: relative;
  }
</style>

<article>
  {#if edit}
    <EditResult {result} on:set-edit={setEdit} />
  {:else}
    <ViewResult {result} on:set-edit={setEdit} />
  {/if}
</article>
