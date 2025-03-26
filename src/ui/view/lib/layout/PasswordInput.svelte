<script lang="ts" module>
  export interface Props {
    field: StoredSafeField;
    value: string;
    host: string;
    policy: StoredSafePasswordPolicy;
    changed: boolean;
  }
</script>

<script lang="ts">
  import { vault } from "@/global/api";
  import { getMessage, LocalizedMessage } from "@/global/i18n";
  import { pwgenIcon } from "@/global/icons";
  import { isPolicyMatch } from "@/global/utils";
  import {
    Duration,
    loading,
    messages,
    MessageType,
    sessions,
  } from "@/ui/stores";

  import Icon from "./Icon.svelte";
  import { StoredSafeExtensionError } from "@/global/errors";

  let { field, value = $bindable(), host, policy, changed }: Props = $props();

  let inputType = $state("password");
  let isValidated: boolean = $state(false);
  let errors: string[] = $state([]);

  $effect(validate);

  function clearValidate() {
    isValidated = false;
    errors = [];
  }

  function validate() {
    if (value?.length > 0) {
      [isValidated, errors] = isPolicyMatch(value, policy);
    } else {
      clearValidate();
    }
  }

  function generatePassword() {
    const token: string | undefined = sessions.data.get(host)?.token;
    if (!token) {
      throw new StoredSafeExtensionError("Token is undefined.");
    }
    loading.add(
      `Add.generatePassword`,
      vault.generatePassword(host, token, {
        policyid: policy.id,
      }),
      {
        onError(error) {
          messages.add(error.message, MessageType.ERROR, Duration.MEDIUM);
        },
        onSuccess(password: string) {
          value = password;
          validate();
        },
      }
    );
  }

  function show(show: boolean) {
    inputType = show ? "text" : "password";
  }

  function handleInput(
    e: Event & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    value = (e.target as HTMLInputElement).value ?? "";
    validate();
  }
</script>

<div class="password-field">
  <input
    id={field.name}
    class="password"
    class:changed
    type={inputType}
    {value}
    onfocus={() => show(true)}
    onblur={() => show(false)}
    oninput={handleInput}
  />
  <button type="button" class="pwgen" onclick={() => generatePassword()}>
    <Icon d={pwgenIcon} size="1.4em" />
  </button>
  <p class="grid">
    {#if isValidated}
      <span class="valid">
        {getMessage(LocalizedMessage.PASSWORD_MATCH_POLICY)}
      </span>
    {/if}
    {#each errors as error}<span class="error">{error}</span>{/each}
  </p>
</div>

<style>
  .password-field {
    display: grid;
    grid-template-columns: 1fr auto;
    border-radius: var(--border-radius);
  }

  .password {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .pwgen {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  .valid {
    color: var(--color-accent);
  }

  .error {
    color: var(--color-danger);
  }
</style>
