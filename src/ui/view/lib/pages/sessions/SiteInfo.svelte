<script lang="ts" module>
  export interface Props {
    host: string;
    session: Session;
  }
</script>

<script lang="ts">
  import { getMessage, LocalizedMessage } from "@/global/i18n";
  import { goto } from "@/global/utils";
  import {
    Duration,
    loading,
    messages,
    MessageType,
    sessions,
    SESSIONS_LOGOUT_LOADING_ID,
  } from "@/ui/stores";

  import Card from "@/ui/view/lib/layout/Card.svelte";
  import SessionStatus from "./siteinfo/SessionStatus.svelte";
  import Violations from "./siteinfo/Violations.svelte";
  import Warnings from "./siteinfo/Warnings.svelte";

  let { host, session }: Props = $props();

  const { createdAt, violations, warnings, token } = session;
  const url = `https://${host}/`;

  function logout() {
    loading.add(
      `${SESSIONS_LOGOUT_LOADING_ID}.${host}`,
      sessions.logout(host, token),
      {
        onError(error) {
          messages.add(error.message, MessageType.ERROR, Duration.MEDIUM);
        },
      }
    );
  }
</script>

<Card>
  <SessionStatus {createdAt} />
  {#if violations.length > 0}
    <Violations {violations} />
  {/if}
  {#if warnings.length > 0}
    <Warnings {warnings} />
  {/if}
</Card>
<div class="sticky-buttons">
  <button type="button" class="primary" onclick={() => goto(url)} title={url}
    >{getMessage(LocalizedMessage.SESSIONS_GOTO, host)}</button
  >
  <button type="button" class="danger" onclick={logout}
    >{getMessage(LocalizedMessage.SESSIONS_LOGOUT)}</button
  >
</div>

<style>
</style>
