<script lang="ts" module>
  import { Logger } from "@/global/logger";

  export const addRequirements = [
    SESSIONS_LOGIN_LOADING_ID,
    SESSIONS_LOGOUT_LOADING_ID,
    INSTANCES_REFRESH_LOADING_ID,
  ];
</script>

<script lang="ts">
  import { vault } from "@/global/api";
  import { getMessage, LocalizedMessage } from "@/global/i18n";
  import {
    sessions,
    instances,
    SESSIONS_LOGIN_LOADING_ID,
    SESSIONS_LOGOUT_LOADING_ID,
    INSTANCES_REFRESH_LOADING_ID,
    loading,
    MessageType,
    Duration,
    messages,
  } from "@/ui/stores";

  import Card from "@/ui/view/lib/layout/Card.svelte";
  import SelectHost from "./SelectHost.svelte";
  import SelectVault from "./SelectVault.svelte";
  import SelectTemplate from "./SelectTemplate.svelte";
  import TemplateFields from "./TemplateFields.svelte";

  const MANDATORY_FIELDS = ["parentid", "groupid", "templateid"];
  const EMPTY_STATE = { parentid: "0" };

  let host: string = $state("");
  let isValid: boolean = $state(false);
  let values: Record<string, any> = $state({ ...EMPTY_STATE });

  let template = $derived(
    instances.instances
      .get(host)
      ?.templates?.find(({ id }) => id === values.templateid)
  );

  function isTemplateField(key: string) {
    return (
      MANDATORY_FIELDS.includes(key) ||
      template?.structure.findIndex(({ name }) => name === key) !== -1
    );
  }

  function add(e: SubmitEvent) {
    e.preventDefault();
    if (!template) {
      messages.add("Template is not set, invalid state.", MessageType.ERROR);
      return;
    }

    const session = sessions.data.get(host);
    if (!session) {
      messages.add("Session is not set, invalid state.", MessageType.ERROR);
      return;
    }

    const addValues: Record<string, any> = {};
    for (const key of Object.keys(values)) {
      if (isTemplateField(key)) {
        addValues[key] = values[key];
      }
    }
    loading.add(`Add.add`, vault.addObject(host, session.token, addValues), {
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
    });
  }
</script>

<section>
  <form class="grid" onsubmit={add}>
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
            onValidate={(value) => (isValid = value)}
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
