<script lang="ts">
  import { countries } from "./countries";

  export let field: StoredSafeField;
  export let value: any;
  export let changed: boolean = false;

  if (value === undefined && field.options_default === undefined) {
    if (field.type === "progress") {
      value = 0;
    } else {
      value = "";
    }
  }

  const props = {
    id: field.name,
    required: field.required,
    placeholder: field.placeholder,
    title: field.placeholder,
  };

  const textProps = {
    ...props,
    type: "text",
    max: 128,
  };

  const textareaProps = {
    ...props,
    max: 512,
  };
</script>

{#if field.type === "textarea"}
  <textarea {...textareaProps} bind:value class:changed />
{:else if field.type === "dropdown"}
  <select id={field.name} bind:value class:changed>
    {#each field.options as opt}
      <option value={opt} selected={opt === field.options_default}>
        {opt}
      </option>
    {/each}
  </select>
{:else if field.type === "countrycode"}
  <select id={field.name} bind:value class:changed>
    {#each countries as [code, country]}
      <option value={code} selected={code === field.options_default}>
        {country}
      </option>
    {/each}
  </select>
{:else if field.type === "progress"}
  <input
    id={field.name}
    type="range"
    min={0}
    max={100}
    bind:value
    class:changed
  />
{:else if field.type === "date"}
  <input id={field.name} type="date" bind:value class:changed />
{:else if field.type === "datetime"}
  <input id={field.name} type="datetime-local" bind:value class:changed />
{:else}<input {...textProps} type="text" bind:value class:changed />{/if}
