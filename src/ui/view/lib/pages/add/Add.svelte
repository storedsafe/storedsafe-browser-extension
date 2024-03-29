<script lang="ts" context="module">
  import { Logger } from "../../../../../global/logger";
  const logger = new Logger("add");

  export const addRequirements = [
    SESSIONS_LOGIN_LOADING_ID,
    SESSIONS_LOGOUT_LOADING_ID,
    STRUCTURE_REFRESH_LOADING_ID,
  ];
</script>

<script lang="ts">
  import { vault } from "../../../../../global/api";
  import { getMessage, LocalizedMessage } from "../../../../../global/i18n";
  import {
    preferences,
    sessions,
    structure,
    SESSIONS_LOGIN_LOADING_ID,
    SESSIONS_LOGOUT_LOADING_ID,
    STRUCTURE_REFRESH_LOADING_ID,
    loading,
    MessageType,
    Duration,
    messages,
  } from "../../../../stores";

  import Card from "../../layout/Card.svelte";
  import SelectHost from "./SelectHost.svelte";
  import SelectVault from "./SelectVault.svelte";
  import SelectTemplate from "./SelectTemplate.svelte";
  import TemplateFields from "./TemplateFields.svelte";
  import { followFocus } from "../../../use/followFocus";

  const MANDATORY_FIELDS = ["parentid", "groupid", "templateid"];
  const EMPTY_STATE = { parentid: "0" };

  let host: string = undefined;
  let isValid: boolean = false;
  let values: Record<string, any> = { ...EMPTY_STATE };

  $: template = $structure
    .get(host)
    ?.templates?.find(({ id }) => id === values.templateid);

  function add() {
    const addValues: Record<string, any> = {};
    for (const key of Object.keys(values)) {
      if (
        MANDATORY_FIELDS.includes(key) ||
        template.structure.findIndex(({ name }) => name === key) !== -1
      ) {
        addValues[key] = values[key];
      }
    }
    loading.add(
      `Add.add`,
      vault.addObject(host, $sessions.get(host).token, addValues),
      {
        onError(error) {
          messages.add(error.message, MessageType.ERROR);
        },
        onSuccess() {
          values = { ...EMPTY_STATE };
          messages.add(
            getMessage(LocalizedMessage.ADD_SUCCESS),
            MessageType.INFO,
            Duration.MEDIUM
          );
        },
      }
    );
  }
</script>

<section>
  <form class="grid" use:followFocus on:submit|preventDefault={add}>
    <Card>
      <SelectHost bind:host />
    </Card>
    {#if host}
      <Card>
        <SelectVault {host} bind:vaultid={values.groupid} />
        <SelectTemplate {host} bind:templateid={values.templateid} />
      </Card>
      {#if !!values.templateid && !!values.groupid}
        <Card>
          <TemplateFields
            {host}
            bind:groupid={values.groupid}
            bind:templateid={values.templateid}
            bind:values
            on:validate={(e) => (isValid = e.detail)}
          />
        </Card>
      {/if}
    {/if}
    <!-- Submit form to add object to StoredSafe -->
    <div class="sticky-buttons">
      <button type="submit" disabled={!isValid}>
        {getMessage(LocalizedMessage.ADD_CREATE)}
      </button>
    </div>
  </form>
</section>
