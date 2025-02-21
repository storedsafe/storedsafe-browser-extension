<script lang="ts">
  import type { Page, PageNavigation } from "@/ui/view/Popup/pages";
  import Icon from "@/ui/view/lib/layout/Icon.svelte";

  interface Props {
    menuItems: PageNavigation[];
    selected: string | null;
    onNavigate?: (page: Page) => void;
  }

  let { menuItems, selected = null, onNavigate }: Props = $props();

  // Track focused and hovered state for accurate coloring
  let focused: string | null = $state(null);
  let hovered: string | null = $state(null);

  // Currently highlighted or selected object, depending on hover/focus state
  let menuItem = $derived(
    menuItems.find((item) => item.route === (hovered ?? focused ?? selected))
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
</script>

<!--
  @component
  Top menu of extension.
  Emits `navigate` event with the menu item name on navigation.
-->
<nav>
  <section
    class="icons"
    class:has-selected={!!menuItem}
    onmouseleave={() => clearHovered}
    role="button"
    tabindex="0"
  >
    {#each menuItems as item (item.route)}
      <button
        type="button"
        class="input-reset"
        class:selected={selected === item.route}
        onmouseenter={() => setHovered(item.route)}
        onfocus={() => setFocused(item.route)}
        onclick={() => onNavigate?.(item.route)}
        onblur={() => clearFocused()}
        aria-label={item.title}
      >
        <Icon {...{ ...iconProps, d: item.icon }} />
      </button>
    {/each}
  </section>
  {#if !!menuItem}
    <section
      class:selected={selected === menuItem.route}
      class:focused={focused === menuItem.route}
      class:hovered={hovered === menuItem.route}
      class="menu-title shadow"
      title={menuItem.title}
    >
      {menuItem.title}
    </section>
  {/if}
</nav>

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
