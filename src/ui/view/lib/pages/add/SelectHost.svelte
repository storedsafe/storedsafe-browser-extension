<script lang="ts" module>
  import { Logger } from "@/global/logger";
  const logger = new Logger("select-host");

  export interface Props {
    host: string;
  }
</script>

<script lang="ts">
  import { getMessage, LocalizedMessage } from "@/global/i18n";
  import { preferences, sessions } from "@/ui/stores";

  let { host = $bindable() }: Props = $props();

  function getDefaultHost(): string {
    const preferredHost = preferences.data.add?.host;
    const hosts: string[] = sessions.data.keys().toArray();
    if (
      preferredHost === null ||
      !hosts.find((host) => host === preferredHost)
    ) {
      return hosts[0];
    }
    return preferredHost;
  }

  function updatePreferences() {
    preferences.setHostPreferences(host).catch(logger.error);
  }

  if (!host) host = getDefaultHost();
</script>

<label>
  <span>{getMessage(LocalizedMessage.ADD_HOST)}</span>
  <select bind:value={host} onchange={() => updatePreferences()}>
    {#each sessions.data.keys() as host (host)}
      <option value={host}>{host}</option>
    {/each}
  </select>
</label>
