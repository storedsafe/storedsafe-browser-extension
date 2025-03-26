<script lang="ts" module>
  export interface Props {
    show: boolean;
    large: boolean;
    password: string;
  }
</script>

<script lang="ts">
  import Encrypted from "./Encrypted.svelte";

  let { show, large, password }: Props = $props();

  function isLower(c: string): boolean {
    return /\p{Ll}/u.test(c);
  }

  function isUpper(c: string): boolean {
    return /\p{Lu}/u.test(c);
  }

  function isNumber(c: string): boolean {
    return /\d/.test(c);
  }

  function isNonAlphanumeric(c: string): boolean {
    return !(isLower(c) || isUpper(c) || isNumber(c));
  }
</script>

<Encrypted {show}>
  <div class="password" class:large>
    {#each password.split("") as c, i}
      <span
        class:lower={isLower(c)}
        class:upper={isUpper(c)}
        class:number={isNumber(c)}
        class:nonalphanumeric={isNonAlphanumeric(c)}
        ><span class="char">{c}</span><span class="count">{i + 1}</span></span
      >
    {/each}
  </div>
</Encrypted>

<style>
  .password {
    font-family: monospace, monospace; /* Fix broken monospace size */
    white-space: pre-wrap;
  }

  .password:not(.large) {
    word-break: break-word;
  }

  .lower {
    color: var(--color-primary);
  }

  .upper {
    color: var(--color-accent);
    font-weight: bold;
  }

  .number {
    color: var(--color-warning);
  }

  .nonalphanumeric {
    color: var(--color-danger);
    font-weight: bold;
  }

  .large {
    display: flex;
    flex-wrap: wrap;
  }

  .count {
    display: none;
    user-select: none;
  }

  .large .count {
    display: initial;
    font-weight: initial;
    font-size: 0.9em;
    color: var(--color-danger-dark);
  }

  .large span.char {
    font-size: 3em;
  }

  .large > span {
    padding: var(--spacing);
    background-color: var(--color-input-bg);
    flex-grow: 1;
    display: grid;
    text-align: center;
    grid-template-rows: 1fr auto;
  }

  .large > span:nth-child(odd) {
    background-color: var(--color-input-bg-light);
  }
</style>
