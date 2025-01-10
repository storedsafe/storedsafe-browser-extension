<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Icon from "../layout/Icon.svelte";

  const dispatch = createEventDispatcher();

  // List of items to display in menu
  export let menuItems: {
    name: string;
    title: string;
    icon: string;
  }[];

  // The currently selected menu item
  export let selected: string = null;
  // Track focused and hovered state for accurate coloring
  let focused: string;
  let hovered: string;
  // Currently highlighted or selected object, depending on hover/focus state
  $: menuItem = menuItems.find(
    (item) => item.name === (hovered ?? focused ?? selected)
  );

  // Set properties of menu icons
  const iconProps = {
    isButton: true,
  };

  /**
   * Clear focused state reference.
   * */
  function clearFocused() {
    focused = null;
    hovered = null;
  }

  /**
   * Set focused state reference.
   * Focused has higher priority than hover,
   * so clear hovered state when focus changes.
   * @param name Name identifier of focused element.
   * */
  function setFocused(name: string) {
    focused = name;
    hovered = null;
  }

  /**
   * Clear hovered state reference.
   * @param name Name identifier of focused element.
   * */
  function clearHovered() {
    hovered = null;
  }

  /**
   * Set hovered state reference.
   * @param name Name identifier of focused element.
   * */
  function setHovered(name: string) {
    hovered = name;
  }

  /**
   * Dispatch event on navigation for parent to handle.
   * @param name Name identifier of focused element.
   * */
  function handleClick(name: string) {
    dispatch("navigate", name);
  }
</script>

<style>
  nav {
    width: 100%;
  }

  button {
    width: 100%;
    padding: calc(var(--spacing) / 2);
    background-color: var(--color-primary-dark);
    border-top: 2px solid transparent;
    transition: background-color 0.2s;
  }

  button:first-child {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  button:last-child {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  section.has-selected button:first-child,
  section.has-selected button:last-child {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  section.has-selected button {
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
    transition: background-color 0.2s;
  }

  button:focus,
  button:hover {
    border-top: 2px solid #fff;
  }

  button:hover,
  .menu-title.hovered,
  button:focus,
  .menu-title.focused {
    background-color: var(--color-accent-light);
  }

  button.selected:not(:hover):not(:focus),
  .menu-title.selected:not(.hovered):not(.focused) {
    background-color: var(--color-accent);
  }

  button:active {
    background-color: #fff;
  }

  .icons {
    display: flex;
    justify-content: space-evenly;
  }

  .menu-title {
    color: #fff;
    text-align: center;
    font-weight: initial;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    padding: calc(var(--spacing) / 2);
    transition: background-color 0.2s;
    user-select: none;
  }
</style>

<!--
  @component
  Top menu of extension.
  Emits `navigate` event with the menu item name on navigation.
-->
<nav>
  <section
    class="icons"
    class:has-selected={!!menuItem}
    on:mouseleave={clearHovered}>
    {#each menuItems as item (item.name)}
      <button
        type="button"
        class="input-reset"
        class:selected={selected === item.name}
        on:mouseenter={() => setHovered(item.name)}
        on:focus={() => setFocused(item.name)}
        on:click={() => handleClick(item.name)}
        on:blur={clearFocused}
        aria-label={item.title}>
        <Icon {...{ ...iconProps, d: item.icon }} />
      </button>
    {/each}
  </section>
  {#if !!menuItem}
    <section
      class:selected={selected === menuItem.name}
      class:focused={focused === menuItem.name}
      class:hovered={hovered === menuItem.name}
      class="menu-title shadow"
      title={menuItem.title}>
      {menuItem.title}
    </section>
  {/if}
</nav>
