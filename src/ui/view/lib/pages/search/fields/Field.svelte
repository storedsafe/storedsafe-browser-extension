<script lang="ts">
  import { getMessage, LocalizedMessage } from "../../../../../../global/i18n";
  import { copyText, goto } from "../../../../../../global/utils";

  import Card from "../../../layout/Card.svelte";
  import Encrypted from "./Encrypted.svelte";
  import Password from "./Password.svelte";

  /* Decrypt if result is not already decrypted. */
  export let decrypt: () => Promise<string>;
  /* Field to be displayed. */
  export let field: StoredSafeField;

  let show: boolean = false;
  let large: boolean = false;

  /**
   * Toggle show state of field.
   * Decrypt first if needed.
   * */
  function toggleShow() {
    const exec = () => (show = !show);
    if (field.isEncrypted) decrypt().then(exec);
    else exec();
  }

  /**
   * Toggle large state of password field.
   * */
  function toggleLarge() {
    large = !large;
  }

  /**
   * Copy field value to clipboard.
   * Decrypt first if needed.
   * */
  async function copy() {
    const exec = async (value: string) => await copyText(value);
    if (field.isEncrypted) await decrypt();
    else await exec(field.value);
  }
</script>

<style>
  .field-title {
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr;
    justify-content: start;
    align-items: center;
    column-gap: var(--spacing);
  }

  .field-title button {
    padding: 0;
    border-radius: 0;
    background: transparent !important;
    box-shadow: none !important;
    color: var(--color-accent);
  }

  .field-title button.warning {
    color: var(--color-warning);
  }

  .field-title button.danger {
    color: var(--color-danger);
  }

  p:not(.textarea) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>

<Card>
  <!-- Field title and buttons -->
  <span class="subtitle field-title">
    {field.title}
    {#if field.isEncrypted}
      {#if !show}
        <button class="danger" on:click={toggleShow}>
          {getMessage(LocalizedMessage.RESULT_SHOW)}
        </button>
      {:else}
        <button class="danger" on:click={toggleShow}>
          {getMessage(LocalizedMessage.RESULT_HIDE)}
        </button>
        {#if field.isPassword}
          <button class="warning" on:click={toggleLarge}>
            {#if !large}
              {getMessage(LocalizedMessage.RESULT_LARGE)}
            {:else}{getMessage(LocalizedMessage.RESULT_SMALL)}{/if}
          </button>
        {/if}
      {/if}
    {/if}
    {#if field.name === 'url' || field.name === 'host'}
      <button class="warning" on:click={() => goto(field.value)}>
        {getMessage(LocalizedMessage.RESULT_LOGIN)}
      </button>
    {/if}
    <button on:click={copy}>
      {getMessage(LocalizedMessage.RESULT_COPY)}
    </button>
  </span>
  <!-- Large text field -->
  {#if field.type === 'textarea'}
    {#if field.isPassword}
      <!-- Large Password field, uses color coded characters -->
      <Password password={field.value} {show} {large} />
    {:else if field.isEncrypted}
      <!-- Large encrypted field -->
      <Encrypted {show}>{field.value}</Encrypted>
    {:else}
      <!-- Large text field -->
      <p class="textarea">{field.value}</p>
    {/if}
    <!-- Small text field, uses ellipsis overflow -->
  {:else}
    <p title={field.value}>
      {#if field.isPassword}
        <!-- Password field, uses color coded characters -->
        <Password password={field.value} {show} {large} />
      {:else if field.isEncrypted}
        <!-- Regular encrypted field -->
        <Encrypted {show}>{field.value}</Encrypted>
      {:else if field.name === 'url' || field.name === 'host'}
        <!-- URL field, create link -->
        <a href={field.value} target="_blank">{field.value}</a>
      {:else}
        <!-- Regular text field -->
        {field.value}
      {/if}
    </p>
  {/if}
</Card>
