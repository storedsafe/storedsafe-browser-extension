<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { structure } from "../../../../stores";
  import PasswordInput from "../../layout/PasswordInput.svelte";
  import AddField from "./AddField.svelte";

  export let host: string;
  export let templateid: string;
  export let groupid: string;
  export let values: Record<string, string>;
  export let edit: boolean = false;

  const dispatch = createEventDispatcher();
  const startValues: Record<string, string> = { ...values };
  let changedFields: Record<string, boolean> = {};

  $: template = $structure
    .get(host)
    ?.templates?.find(({ id }) => id === templateid);
  $: vault = $structure.get(host)?.vaults?.find(({ id }) => id === groupid);
  $: policy = $structure
    .get(host)
    ?.policies?.find(({ id }) => id === vault?.policyId);

  function mapChanges(values: Record<string, string>) {
    changedFields = {};
    let hasChanges = false;
    Object.entries(startValues).forEach(([field, value]) => {
      changedFields[field] = values[field] !== value;
      if (changedFields[field]) hasChanges = true;
    });
    return hasChanges;
  }

  function validateField({ required }, value: string) {
    let isValid: boolean = true;
    if (required) {
      if (typeof value === "string") {
        isValid = value?.length > 0;
      } else {
        isValid = value !== undefined;
      }
    }
    return isValid;
  }

  function validate(values: Record<string, string>) {
    if (edit) {
      if (!mapChanges(values)) {
        dispatch("validate", false);
        return
      }
    }
    const validFields = template?.structure.map((field) =>
      validateField(field, values[field.name])
    );
    const isValid = validFields.reduce(
      (valid, validField) => valid && validField,
      true
    );
    dispatch("validate", isValid);
  }

  $: validate(values);
</script>

{#if !!template && !!policy}
  {#each template?.structure as field (host + values.templateid + field.name)}
    <!-- StoredSafe Template -->
    {#if field.pwgen}
      <PasswordInput
        {field}
        bind:value={values[field.name]}
        {host}
        {policy}
        changed={edit && changedFields[field.name]}
      />
    {:else}
      <AddField
        {field}
        bind:value={values[field.name]}
        changed={edit && changedFields[field.name]}
      />
    {/if}
  {/each}
{/if}
