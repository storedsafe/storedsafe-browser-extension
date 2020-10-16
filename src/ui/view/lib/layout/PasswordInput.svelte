<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { pwgenIcon } from "../../../../global/icons";

  import Icon from "./Icon.svelte";

  export let value: string;

  const dispatch = createEventDispatcher();

  function generatePassword() {
    dispatch("pwgen");
  }
</script>

<style>
  .password-field {
    display: grid;
    grid-template-columns: 1fr auto;
    border-radius: var(--border-radius);
  }

  .password {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .pwgen {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
</style>

<article class="password-field">
  <input class="password" type="password" bind:value {...$$restProps} />
  <button type="button" class="pwgen" on:click={generatePassword}>
    <Icon d={pwgenIcon} size="1.4em" />
  </button>
</article>
