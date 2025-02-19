<script lang="ts">
  import { getMessage, LocalizedMessage } from "@/global/i18n";
  import { instances, messages, MessageType } from "@/ui/stores";
  import PasswordInput from "@/ui/view/lib/layout/PasswordInput.svelte";
  import AddField from "./AddField.svelte";

  interface Props {
    host: string;
    templateid: string;
    groupid: string;
    values: Record<string, string>;
    edit?: boolean;
    onValidate: (isValid: boolean) => void;
  }

  let {
    host,
    templateid = $bindable(),
    groupid = $bindable(),
    values = $bindable(),
    edit = false,
    onValidate,
  }: Props = $props();

  const startValues: Record<string, string> = { ...values };
  let changedFields: Record<string, boolean> = $state({});

  let template = $derived(
    instances.instances
      .get(host)
      ?.templates?.find(({ id }) => id === templateid)
  );
  let vault = $derived(
    instances.instances.get(host)?.vaults?.find(({ id }) => id === groupid)
  );
  let policy = $derived(
    instances.instances
      .get(host)
      ?.policies?.find(({ id }) => id === vault?.policyId)
  );

  function mapChanges(values: Record<string, string>) {
    changedFields = {};
    let hasChanges = false;
    Object.entries(startValues).forEach(([field, value]) => {
      changedFields[field] = values[field] !== value;
      if (changedFields[field]) hasChanges = true;
    });
    return hasChanges;
  }

  function validateField({ required }: StoredSafeField, value: string) {
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
    if (!template) {
      messages.add("Template is not set, invalid state.", MessageType.ERROR);
      return;
    }
    if (edit) {
      if (!mapChanges(values)) {
        onValidate(false);
        return;
      }
    }

    for (const field of template.structure) {
      if (!validateField(field, values[field.name])) {
        onValidate(false);
        return;
      }
    }
    onValidate(true);
  }

  $effect(() => {
    validate(values);
  });
</script>

{#if !!template && !!policy}
  {#each template?.structure as field (host + values.templateid + field.name)}
    <label for={field.name}>
      <span class:required={field.required}>
        {field.title}
        {#if field.type === "progress"}({values[field.name] ?? 0}%){/if}
        {#if field.isEncrypted}
          <span
            class="encrypted"
            title={getMessage(LocalizedMessage.ENCRYPTED_TITLE)}
          >
            [enc]
          </span>
        {/if}
      </span>
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
    </label>
  {/each}
{/if}

<style>
  .required::before {
    content: "*";
    color: var(--color-danger);
  }

  .encrypted {
    color: var(--color-danger);
  }
</style>
