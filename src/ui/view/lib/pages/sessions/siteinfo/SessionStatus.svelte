<script lang="ts">
  import {
    getLocale,
    getMessage,
    LocalizedMessage,
  } from "../../../../../../global/i18n";
  import { time } from "../../../../../stores/time";

  export let createdAt: number;

  // Update timer every minute
  const interval = 6e4;
  // Time to next full minute
  const alignTimeout = 6e4 - ((Date.now() - createdAt) % 6e4);
  // Generate locale-specific time string displaying time of login
  const onlineSince = new Date(createdAt).toLocaleTimeString(getLocale());
  // Start tracking the current time, aligned to whole minutes since login
  const currentTime = time(interval, alignTimeout);

  // Time since login
  $: onlineDuration = $currentTime - createdAt;
  // Full minutes since login
  $: minutes = Math.floor(onlineDuration / 6e4);
</script>

<section class="grid">
  <h2>{getMessage(LocalizedMessage.SESSIONS_STATUS)}</h2>
  <p>
    {getMessage(LocalizedMessage.SESSIONS_ONLINE_SINCE, onlineSince, minutes)}
  </p>
</section>
