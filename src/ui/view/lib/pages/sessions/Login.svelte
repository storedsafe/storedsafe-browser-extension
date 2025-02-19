<script lang="ts">
  import {
    loading,
    messages,
    Messages,
    MessageType,
    preferences,
    sessions,
    PREFERENCES_SET_SITE_LOADING_ID,
    SESSIONS_LOGIN_LOADING_ID,
  } from "@/ui/stores";
  import { getMessage, LocalizedMessage } from "@/global/i18n";
  import { clearMessages } from "@/ui/view/use/clearMessages";
  import { StoredSafeExtensionError } from "@/global/errors";

  import Card from "@/ui/view/lib/layout/Card.svelte";
  import MessageViewer from "@/ui/view/lib/layout/MessageViewer.svelte";
  import Checkbox from "@/ui/view/lib/layout/Checkbox.svelte";

  const {
    site
  }: {
    site: Site
  } = $props()

  const loginMessages = new Messages();

  let sitesPreferences = preferences.data.sites ?? new Map()
  let loginType: LoginType = $state(sitesPreferences.get(site.host)?.loginType ?? "totp");
  let username: string = $state(sitesPreferences.get(site.host)?.username ?? "");
  let passphrase: string = $state("");
  let otp: string = $state("");
  let keys: string = $state("");
  let remember: boolean = $state(!!sitesPreferences.get(site.host)?.username);

  $effect(() => {
    keys = passphrase
  })

  let isValidated = $derived.by(() => {
    if (loginType === "totp") {
      return username.length > 0 && passphrase.length > 0 && otp.length > 0
    }
    if (loginType === "yubikey") {
      return username.length > 0 && keys.length > 44 // (keys = passphrase + yubico otp)
    }
    return false
  })

  function handleLogin(e: SubmitEvent) {
    e.preventDefault();

    // Clear old messages since they're related to previous login attempt
    loginMessages.clear();

    // Validate the login type and choose accordingly
    let promise: Promise<any>;
    if (loginType === "totp") {
      promise = sessions.loginTotp(site, username, passphrase, otp);
    } else if (loginType === "yubikey") {
      promise = sessions.loginYubikey(
        site,
        username,
        keys.slice(0, -44),
        keys.slice(-44)
      );
    } else {
      promise = Promise.reject(
        new StoredSafeExtensionError(`Invalid login type: ${loginType}`)
      );
    }

    // Wait for result
    loading.add(SESSIONS_LOGIN_LOADING_ID, promise, {
      onSuccess() {
        // Update preferences to default to current site on successful login
        loading.add(
          PREFERENCES_SET_SITE_LOADING_ID,
          preferences.setSitePreferences(site.host, {
            username: remember ? username : "",
            loginType,
          }),
          {
            onError(error) {
              messages.add(error.message, MessageType.ERROR);
            },
          }
        );
      },
      onError(error) {
        loginMessages.add(error.message, MessageType.ERROR);
      },
    });
  }
</script>

<form
  class="grid"
  onsubmit={handleLogin}
  use:clearMessages={{ clear: loginMessages.clear }}
>
  <Card>
    <label for="loginType">
      {getMessage(LocalizedMessage.SESSIONS_LOGIN_TYPE)}
      <select id="loginType" bind:value={loginType}>
        <option value={"totp"}>
          {getMessage(LocalizedMessage.SESSIONS_LOGIN_TYPE_TOTP)}
        </option>
        <option value={"yubikey"}>
          {getMessage(LocalizedMessage.SESSIONS_LOGIN_TYPE_YUBIKEY)}
        </option>
      </select>
    </label>
    <label for="username">
      {getMessage(LocalizedMessage.SESSIONS_USERNAME)}
      <input
        type="text"
        id="username"
        autocomplete="username"
        bind:value={username}
        required
      />
    </label>
    {#if loginType == "totp"}
      <label for="passphrase">
        {getMessage(LocalizedMessage.SESSIONS_PASSPHRASE)}
        <input
          type="password"
          id="passphrase"
          autocomplete="current-password"
          bind:value={passphrase}
          required
        />
      </label>
      <label for="otp">
        {getMessage(LocalizedMessage.SESSIONS_OTP)}
        <input id="otp" autocomplete="off" bind:value={otp} required />
      </label>
    {:else if loginType == "yubikey"}
      <label for="keys">
        {getMessage(LocalizedMessage.SESSIONS_KEYS)}
        <input
          type="password"
          id="keys"
          autocomplete="current-password"
          bind:value={keys}
          required
        />
      </label>
    {/if}
    <label class="label-inline" for="remember">
      <Checkbox id="remember" bind:checked={remember} />
      <span>{getMessage(LocalizedMessage.SESSIONS_REMEMBER)}</span>
    </label>
  </Card>
  <div class="sticky-buttons">
    <MessageViewer messages={loginMessages} />
    <button type="submit" disabled={!isValidated}>
      {getMessage(LocalizedMessage.SESSIONS_LOGIN)}
    </button>
  </div>
</form>
