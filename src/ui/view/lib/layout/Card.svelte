<script lang="ts">
  export let backgroundColor: string = "var(--color-bg)";
  export let color: string = "var(--color-fg)";
</script>

<style>
  article {
    overflow: hidden auto;
    background-color: var(--card-bg);
    color: var(--card-fg);
    padding: var(--spacing);
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
    border-radius: var(--border-radius);
  }

  .card :global(h1),
  .card :global(h2),
  .card :global(h3),
  .card :global(h4),
  .card :global(h5),
  .card :global(h6) {
    color: var(--color-primary);
    text-align: left;
  }
</style>

<!--
  @component
  Card-style container for creating uniform page content.
-->
<article
  class="grid card"
  style={`
    --card-bg: ${backgroundColor};
    --card-fg: ${color};
    `}>
  <slot />
</article>
