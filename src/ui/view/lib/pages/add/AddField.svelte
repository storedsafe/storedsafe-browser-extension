<script lang="ts">
  import { countries } from "./countries";

  export let field: StoredSafeField;
  export let value: any;

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

<style>
  .required::before {
    content: "*";
    color: var(--color-danger);
  }
</style>

<label for={field.name}>
  <span class:required={field.required}>
    {field.title}
    {#if field.type === 'progress'}({value}%){/if}
  </span>
  {#if field.type === 'textarea'}
    <textarea {...textareaProps} bind:value />
  {:else if field.type === 'dropdown'}
    <select id={field.name} bind:value>
      {#each field.options as opt}
        <option value={opt} selected={opt === field.options_default}>
          {opt}
        </option>
      {/each}
    </select>
  {:else if field.type === 'countrycode'}
    <select id={field.name} bind:value>
      {#each countries as [code, country]}
        <option value={code} selected={code === field.options_default}>
          {country}
        </option>
      {/each}
    </select>
  {:else if field.type === 'progress'}
    <input id={field.name} type="range" min={0} max={100} bind:value />
  {:else if field.type === 'date'}
    <input id={field.name} type="date" bind:value />
  {:else if field.type === 'datetime'}
    <input id={field.name} type="datetime-local" bind:value />
  {:else}<input {...textProps} type="text" bind:value />{/if}
</label>
