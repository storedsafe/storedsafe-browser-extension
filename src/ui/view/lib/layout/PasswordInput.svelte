<script lang="ts">
  import { afterUpdate } from "svelte";

  import { vault } from "../../../../global/api";
  import { getMessage, LocalizedMessage } from "../../../../global/i18n";
  import { pwgenIcon } from "../../../../global/icons";
  import { isPolicyMatch } from "../../../../global/utils";
  import {
    Duration,
    loading,
    messages,
    MessageType,
    sessions,
  } from "../../../stores";

  import Icon from "./Icon.svelte";

  export let field: StoredSafeField;
  export let value: string;
  export let host: string;
  let prevPolicy: StoredSafePasswordPolicy = null;
  export let policy: StoredSafePasswordPolicy;
  export let changed: boolean = false;
  let inputType = "password";

  if (value === undefined) {
    value = "";
  }

  let isValidated: boolean = false,
    errors: string[] = [];

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
    loading.add(
      `Add.generatePassword`,
      vault.generatePassword(host, $sessions.get(host).token, {
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

  afterUpdate(() => {
    if (prevPolicy !== policy) {
      prevPolicy = policy;
      validate();
    }
  });

  function handleInput(e) {
    value = e.target.value ?? "";
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
    on:focus={() => show(true)}
    on:blur={() => show(false)}
    on:input={handleInput}
  />
  <button type="button" class="pwgen" on:click={generatePassword}>
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
