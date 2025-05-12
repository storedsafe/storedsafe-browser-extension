<script lang="ts">
  import type { ChangeEventHandler, HTMLAttributes } from "svelte/elements";
  import { getMessage, LocalizedMessage } from "../../../../global/i18n";

  interface Props extends HTMLAttributes<HTMLInputElement> {
    size?: string;
    altered?: boolean;
    disabled?: boolean;
    checked?: boolean;
    onchange?: ChangeEventHandler<HTMLInputElement>;
  }

  let {
    size = "1em",
    altered = false,
    disabled = false,
    checked = $bindable(),
    onchange,
    ...restProps
  }: Props = $props();

  const style = [`--toggle-size: ${size}`].join(";");
</script>

<span class="toggle-container">
  <input
    bind:checked
    {onchange}
    {disabled}
    type="checkbox"
    class="toggle-hidden"
    {...restProps}
  />
  <span
    class="toggle custom-input"
    class:altered
    {style}
    title={checked
      ? getMessage(LocalizedMessage.SETTINGS_ON)
      : getMessage(LocalizedMessage.SETTINGS_OFF)}
  >
  </span>
</span>

<style>
  .toggle-container {
    --toggle-size: 1em;
    position: relative;
    height: var(--toggle-size);
    width: calc(2 * var(--toggle-size));
  }

  .toggle-hidden {
    position: absolute;
    opacity: 0;
    height: 0;
    width: 0;
  }

  .toggle {
    position: absolute;
    font-size: var(--toggle-size);
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    border-radius: 9999px;
    cursor: pointer;
  }

  .toggle-hidden:checked ~ .toggle {
    background-color: var(--color-accent);
  }

  .toggle-hidden:disabled ~ .toggle {
    background-color: var(--color-input-fg-disabled);
  }

  .toggle-hidden:disabled:checked ~ .toggle {
    background-color: var(--color-button-bg-disabled);
  }

  .toggle:after {
    content: "";
    position: absolute;
  }

  .toggle-hidden:checked ~ .toggle:after {
    left: 40%;
  }

  .toggle:after {
    left: 0;
    top: 0;
    width: 60%;
    height: 100%;
    background: white;
    border: 1px solid white;
    border-radius: 9999px;
    box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.8);
    box-sizing: border-box;
    transition: left 0.1s;
  }
</style>
