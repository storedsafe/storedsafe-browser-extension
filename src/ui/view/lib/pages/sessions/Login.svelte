<script lang="ts">
  import {
    loading,
messages,
        messageStore,
    MessageType,
    preferences,
    sessions,
  } from "../../../../stores";
  import { getMessage, LocalizedMessage } from "../../../../../global/i18n";
  import { clearMessages } from "../../../use/clearMessages";
  import { StoredSafeExtensionError } from "../../../../../global/errors";

  import Card from "../../layout/Card.svelte";
  import MessageViewer from "../../layout/MessageViewer.svelte";

  export let site: Site;

  const loginMessages = messageStore();

  let loginType: LoginType =
    $preferences.sites.get(site.host)?.loginType ?? "totp";
  let username: string = $preferences.sites.get(site.host)?.username ?? "";
  let passphrase: string = "";
  let otp: string = "";
  $: keys = passphrase;
  let remember: boolean = false;

  $: isValidated =
    loginType === "totp"
      ? username.length > 0 && passphrase.length > 0 && otp.length > 0
      : loginType === "yubikey"
      ? username.length > 0 && keys.length > 44
      : false;

  function handleLogin() {
    loginMessages.clear();
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
    loading.add(`Login.${loginType}`, promise, {
      onSuccess() {
        loading.add(
          `Login.savePreferences`,
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
  on:submit|preventDefault={handleLogin}
  use:clearMessages={{ clear: loginMessages.clear }}>
  <Card>
    <label for="loginType">
      {getMessage(LocalizedMessage.SESSIONS_LOGIN_TYPE)}
      <select id="loginType" bind:value={loginType}>
        <option value={'totp'}>
          {getMessage(LocalizedMessage.SESSIONS_LOGIN_TYPE_TOTP)}
        </option>
        <option value={'yubikey'}>
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
        required />
    </label>
    {#if loginType == 'totp'}
      <label for="passphrase">
        {getMessage(LocalizedMessage.SESSIONS_PASSPHRASE)}
        <input
          type="password"
          id="passphrase"
          autocomplete="current-password"
          bind:value={passphrase}
          required />
      </label>
      <label for="otp">
        {getMessage(LocalizedMessage.SESSIONS_OTP)}
        <input id="otp" autocomplete="off" bind:value={otp} required />
      </label>
    {:else if loginType == 'yubikey'}
      <label for="keys">
        {getMessage(LocalizedMessage.SESSIONS_KEYS)}
        <input
          type="password"
          id="keys"
          autocomplete="current-password"
          bind:value={keys}
          required />
      </label>
    {/if}
    <label class="label-inline" for="remember">
      <input type="checkbox" id="remember" bind:checked={remember} />
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
