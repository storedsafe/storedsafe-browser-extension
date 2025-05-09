<script lang="ts" module>
  export interface Props {
    /* Decrypt if result is not already decrypted. */
    decrypt: () => Promise<string>;
    /* Field to be displayed. */
    field: StoredSafeField;
    /* The StoredSafe object. */
    result: StoredSafeObject;
  }
</script>

<script lang="ts">
  import { getMessage, LocalizedMessage } from "@/global/i18n";
  import { copyText, openURL } from "@/global/utils";
  import { loading } from "@/ui/stores";

  import Card from "@/ui/view/lib/layout/Card.svelte";
  import Encrypted from "./Encrypted.svelte";
  import Password from "./Password.svelte";
  import { Context, sendMessage } from "@/global/messages";

  let { decrypt, result, field }: Props = $props();

  let show: boolean = $state(false);
  let large: boolean = $state(false);

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
    let promise = Promise.resolve(field.value ?? "");
    if (field.isEncrypted) promise = decrypt();
    loading.add(
      `Field.copy`,
      promise.then(async (value) => await exec(value))
    );
  }

  /**
   * Open the url and fill login forms automatically when the page loads.
   * @param url
   */
  async function login(url: string) {
    await sendMessage({
      from: Context.POPUP,
      to: Context.BACKGROUND,
      action: "fill.pending",
      data: {
        url: url,
        result,
      },
    });
    await openURL(field.value ?? "#");
  }
</script>

<Card>
  <!-- Field title and buttons -->
  <span class="subtitle field-title">
    {field.title}
    {#if field.isEncrypted}
      {#if !show}
        <button class="danger" onclick={toggleShow}>
          {getMessage(LocalizedMessage.RESULT_SHOW)}
        </button>
      {:else}
        <button class="danger" onclick={toggleShow}>
          {getMessage(LocalizedMessage.RESULT_HIDE)}
        </button>
        {#if field.isPassword}
          <button class="warning" onclick={toggleLarge}>
            {#if !large}
              {getMessage(LocalizedMessage.RESULT_LARGE)}
            {:else}{getMessage(LocalizedMessage.RESULT_SMALL)}{/if}
          </button>
        {/if}
      {/if}
    {/if}
    {#if (field.name === "url" || field.name === "host") && field.value}
      <button class="warning" onclick={() => login(field.value ?? "#")}>
        {getMessage(LocalizedMessage.RESULT_LOGIN)}
      </button>
    {/if}
    <button onclick={copy}>
      {getMessage(LocalizedMessage.RESULT_COPY)}
    </button>
  </span>
  <!-- Large text field -->
  {#if field.type === "textarea"}
    {#if field.isPassword}
      <!-- Large Password field, uses color coded characters -->
      <Password password={field.value ?? ""} {show} {large} />
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
        <Password password={field.value ?? ""} {show} {large} />
      {:else if field.isEncrypted}
        <!-- Regular encrypted field -->
        <Encrypted {show}>{field.value}</Encrypted>
      {:else if field.type === "progress"}
        <!-- Progress bar -->
        <span class="progress">
          <progress value={field.value} max="100"></progress>
          {field.value}%
        </span>
      {:else if field.name === "url" || field.name === "host"}
        <!-- URL field, create link -->
        <a href={field.value} target="_blank">{field.value}</a>
      {:else}
        <!-- Regular text field -->
        {field.value}
      {/if}
    </p>
  {/if}
</Card>

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

  .progress {
    display: flex;
    column-gap: var(--spacing);
  }

  .progress progress {
    flex-grow: 1;
  }
</style>
