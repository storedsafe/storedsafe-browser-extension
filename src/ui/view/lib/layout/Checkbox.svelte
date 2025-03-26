<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";

  export interface Props extends HTMLAttributes<HTMLInputElement> {
    size?: string;
    altered?: boolean;
    disabled?: boolean;
    checked?: boolean;
  }
</script>

<script lang="ts">
  let {
    size = "1em",
    altered = false,
    disabled = false,
    checked = $bindable(),
    ...restProps
  }: Props = $props();

  const style = [`--checkbox-size: ${size}`].join(";");
</script>

<span class="checkbox-container">
  <input
    bind:checked
    {disabled}
    type="checkbox"
    class="checkbox-hidden"
    {...restProps}
  />
  <span class="checkbox custom-input" class:altered {style}></span>
</span>

<style>
  .checkbox-container {
    --checkbox-size: 1em;
    position: relative;
    height: var(--checkbox-size);
    width: var(--checkbox-size);
  }

  .checkbox-hidden {
    position: absolute;
    opacity: 0;
    height: 0;
    width: 0;
  }

  .checkbox {
    position: absolute;
    font-size: var(--checkbox-size);
    top: 0;
    left: 0;
    height: var(--checkbox-size);
    width: var(--checkbox-size);
    cursor: pointer;
  }

  .checkbox-hidden:checked ~ .checkbox {
    background-color: var(--color-accent);
  }

  .checkbox:after {
    content: "";
    position: absolute;
    display: none;
  }

  .checkbox-hidden:checked ~ .checkbox:after {
    display: block;
  }

  .checkbox-hidden:disabled ~ .checkbox {
    background-color: var(--color-input-fg-disabled);
  }

  .checkbox-hidden:disabled:checked ~ .checkbox {
    background-color: var(--color-button-bg-disabled);
  }

  .checkbox:after {
    left: 30%;
    bottom: 17%;
    width: 40%;
    height: 80%;
    border: solid white;
    border-width: 0 0.15em 0.15em 0;
    box-sizing: border-box;
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
  }
</style>
