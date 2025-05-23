<script lang="ts">
  import { vault } from "@/global/api";
  import { getMessage, LocalizedMessage } from "@/global/i18n";
  import { copyText } from "@/global/utils";
  import { loading, messages, MessageType, instances } from "@/ui/stores";
  import { sessions, sites } from "@/ui/stores/browserstorage";

  import Card from "@/ui/view/lib/layout/Card.svelte";
  import Password from "../search/fields/Password.svelte";
  import { StoredSafeExtensionError } from "@/global/errors";

  let host: string = $state(sessions.data.keys().next().value ?? "");
  let password: string = $state("");
  let large: boolean = $state(false);
  let edit: boolean = $state(false);

  const passwordTypes: {
    [key: string]: {
      title: string;
      fields: {
        [field: string]: {
          title: string;
          type: "dropdown" | "range";
          default: any;
          options?: { title: string; value: any }[];
          attributes?: Record<string, any>;
        };
      };
    };
  } = {
    pin: {
      title: "PIN",
      fields: {
        length: {
          title: getMessage(LocalizedMessage.GENERATE_PASSWORD_LENGTH),
          type: "range",
          default: 4,
          attributes: {
            min: 1,
            max: 40,
          },
        },
      },
    },

    pronounceable: {
      title: "Pronounceable",
      fields: {
        length: {
          title: getMessage(LocalizedMessage.GENERATE_PASSWORD_LENGTH),
          type: "range",
          default: 12,
          attributes: {
            min: 1,
            max: 100,
          },
        },
      },
    },

    secure: {
      title: "Secure",
      fields: {
        length: {
          title: getMessage(LocalizedMessage.GENERATE_PASSWORD_LENGTH),
          type: "range",
          default: 40,
          attributes: {
            min: 1,
            max: 100,
          },
        },
      },
    },

    opie: {
      title: "Opie",
      fields: {
        delimiter: {
          title: getMessage(LocalizedMessage.GENERATE_PASSWORD_DELIMITER),
          type: "dropdown",
          default: "space",
          options: [
            { title: "dash", value: "dash" },
            { title: "space", value: "space" },
            // { title: "default", value: "default" }, // Default = space for opie
          ],
          attributes: {},
        },
      },
    },

    diceword: {
      title: "Dice",
      fields: {
        language: {
          title: getMessage(LocalizedMessage.GENERATE_PASSWORD_LANGUAGE),
          type: "dropdown",
          default: /sv/.test(browser.i18n.getUILanguage()) ? "sv_SE" : "en_US",
          options: [
            { title: "Svenska", value: "sv_SE" },
            { title: "English", value: "en_US" },
          ],
        },
        words: {
          title: getMessage(LocalizedMessage.GENERATE_PASSWORD_WORDS),
          type: "range",
          default: 5,
          attributes: {
            min: 1,
            max: 24,
          },
        },
        min_char: {
          title: getMessage(LocalizedMessage.GENERATE_PASSWORD_MIN_CHAR),
          type: "range",
          default: 5,
          attributes: {
            min: 1,
            max: 24,
          },
        },
        max_char: {
          title: getMessage(LocalizedMessage.GENERATE_PASSWORD_MAX_CHAR),
          type: "range",
          default: 0,
          attributes: {
            min: 0,
            max: 24,
          },
        },
        delimiter: {
          title: getMessage(LocalizedMessage.GENERATE_PASSWORD_DELIMITER),
          type: "dropdown",
          default: "default",
          options: [
            { title: "dash", value: "dash" },
            { title: "space", value: "space" },
            { title: "default", value: "default" },
          ],
        },
      },
    },
  };

  let values: Record<string, any> = $state({});
  let policyid: number | undefined = $state();

  /**
   * Update the password type and optionally generate a new password.
   * If the current password type is different from the new password type,
   * `values` will be reset and assigned to the default values of the new
   * password type.
   * @param passwordType New password type.
   * @param shouldGenerate Set to false to not generate a password during setup.
   */
  function setPasswordType(
    passwordType: string,
    shouldGenerate: boolean = true
  ) {
    if (values.type !== passwordType) {
      values = {};
      values.type = passwordType;
      for (const field of Object.keys(passwordTypes[passwordType].fields)) {
        values[field] = passwordTypes[passwordType].fields[field].default;
      }
    }
    if (shouldGenerate) generate();
  }

  setPasswordType("secure", false);
  let fields = $derived(passwordTypes[values.type]?.fields);

  let lastError: number | null = null;
  function clearLastError() {
    if (lastError !== null) {
      messages.remove(lastError);
      lastError = null;
    }
  }

  function generate(options: object | null = null) {
    edit = false;
    clearLastError();
    const token: string | undefined = sessions.data.get(host)?.token;
    if (!token) {
      throw new StoredSafeExtensionError("Token is undefined.");
    }
    loading.add(
      `PasswordGenerator.generate`,
      vault.generatePassword(host, token, options ?? values),
      {
        onError(error) {
          lastError = messages.add(error.message, MessageType.ERROR);
        },
        onSuccess(newPassword: string) {
          password = newPassword;
        },
      }
    );
  }

  function onSubmitGenerate(e: SubmitEvent) {
    e.preventDefault()
    generate()
  }

  function onSubmitFromPolicy(e: SubmitEvent) {
    e.preventDefault()
    if (policyid) generate({ policyid });
    else generate()
  }

  const toggleLarge = (): void => {
    large = !large;
  };

  const toggleEdit = (): void => {
    edit = !edit;
  };

  /**
   * Copy field value to clipboard.
   * */
  async function copy() {
    clearLastError();
    try {
      await copyText(password);
    } catch (error: any) {
      lastError = messages.add(error.message, MessageType.ERROR);
    }
  }
</script>

<section class="grid">
  {#if sites.data.length > 1}
    <Card>
      <label for="host">
        <span> {getMessage(LocalizedMessage.GENERATE_PASSWORD_HOST)} </span>
        <select bind:value={host}>
          {#each [...sessions.data.keys()] as sessionHost (sessionHost)}
            <option value={sessionHost}>{sessionHost}</option>
          {/each}
        </select>
      </label>
    </Card>
  {/if}
  {#if password?.length >= 1}
    <article class="password">
      <Card>
        <span class="subtitle password-title">
          {getMessage(LocalizedMessage.GENERATE_PASSWORD_LABEL)}
          {#if edit}
            <button class="primary" onclick={toggleEdit} type="button">
              {getMessage(LocalizedMessage.GENERATE_PASSWORD_PREVIEW)}
            </button>
          {:else}
            <button class="primary" onclick={toggleEdit} type="button">
              {getMessage(LocalizedMessage.GENERATE_PASSWORD_EDIT)}
            </button>
            <button class="warning" onclick={toggleLarge} type="button">
              {#if !large}
                {getMessage(LocalizedMessage.RESULT_LARGE)}
              {:else}{getMessage(LocalizedMessage.RESULT_SMALL)}{/if}
            </button>
          {/if}
          <button onclick={copy} type="button">
            {getMessage(LocalizedMessage.RESULT_COPY)}
          </button>
        </span>
        {#if edit}
          <textarea bind:value={password}></textarea>
        {:else}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <div
            class="password-preview"
            onclick={copy}
            title={getMessage(LocalizedMessage.RESULT_COPY)}
            role="button"
            tabindex="0"
          >
            <Password show={true} {large} {password} />
          </div>
        {/if}
      </Card>
    </article>
  {/if}
  <Card>
    <form class="policy" onsubmit={onSubmitFromPolicy}>
      <button type="submit">
        {getMessage(LocalizedMessage.GENERATE_PASSWORD_MATCH_POLICY)}
      </button>
      <select bind:value={policyid}>
        {#each instances.instances.get(host)?.policies ?? [] as policy}
          <option value={policy.id}>{policy.name}</option>
        {/each}
      </select>
    </form>
    <p class="or subtitle">
      {getMessage(LocalizedMessage.GENERATE_PASSWORD_OR)}
    </p>
    <form class="generate" onsubmit={onSubmitGenerate}>
      <article class="buttons">
        {#each Object.keys(passwordTypes) as type (type)}
          <button
            type="button"
            class="primary"
            class:selected={values.type === type}
            onclick={() => setPasswordType(type)}>{passwordTypes[type].title}</button
          >
        {/each}
      </article>
      {#if !!fields}
        <article class="fields">
          {#each Object.keys(fields) as field (field)}
            <label for={field} class="label-inline">
              <span>{fields[field].title}</span>
              {#if fields[field].type === "dropdown"}
                <select id={field} bind:value={values[field]}>
                  {#each fields[field].options ?? [] as { value, title } (value)}
                    <option {value}>{title}</option>
                  {/each}
                </select>
              {:else if fields[field].type === "range"}
                {values[field]}
                <input
                  id={field}
                  type="range"
                  {...fields[field].attributes}
                  bind:value={values[field]}
                />
              {/if}
            </label>
          {/each}
        </article>
      {/if}
      <button type="submit">
        {getMessage(LocalizedMessage.GENERATE_PASSWORD_GENERATE)}
      </button>
    </form>
  </Card>
</section>

<style>
  .buttons {
    display: flex;
    flex-direction: row;
    justify-content: stretch;
    width: 100%;
  }

  button {
    width: 100%;
    border-radius: 0;
    flex-grow: 1;
  }

  .buttons button {
    box-shadow: none !important;
  }

  .buttons button:first-child {
    border-top-left-radius: var(--border-radius);
  }

  .buttons button:last-child {
    border-top-right-radius: var(--border-radius);
  }

  .buttons button.selected {
    background-color: var(--color-bg);
    color: var(--color-fg);
  }

  .policy > * {
    width: 100%;
    border-radius: 0;
  }

  .policy > *:first-child,
  .generate > *:first-child {
    border-top-right-radius: var(--border-radius);
    border-top-left-radius: var(--border-radius);
  }

  .policy > *:last-child,
  .generate > *:last-child {
    border-bottom-right-radius: var(--border-radius);
    border-bottom-left-radius: var(--border-radius);
  }

  .fields {
    padding: var(--spacing);
    background-color: var(--color-primary-dark);
    color: var(--color-fg-light);
    box-shadow: 0 0 2px 2px rgba(0, 0, 0, 0.2) inset;
  }

  .fields label {
    display: grid;
    grid-template-columns: 1fr;
    grid-auto-flow: column;
  }

  .password-title {
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr;
    justify-content: start;
    align-items: center;
    column-gap: var(--spacing);
  }

  .password-title button {
    padding: 0;
    border-radius: 0;
    background: transparent !important;
    box-shadow: none !important;
    color: var(--color-accent);
  }

  .password-title button.primary {
    color: var(--color-primary);
  }

  .password-title button.warning {
    color: var(--color-warning);
  }

  .or {
    display: flex;
    align-items: center;
    text-align: center;
    justify-content: center;
    text-transform: uppercase;
    user-select: none;
  }

  .or::before,
  .or::after {
    content: "";
    flex-grow: 1;
    height: 2px;
    background-color: var(--color-primary-light);
    margin: 0 var(--spacing);
  }

  .password-preview {
    cursor: pointer;
  }
</style>
