<script lang="ts">
  import templateIcons from "../../../global/template_icons";

  export let selected: boolean = false;

  export let icon: string;
  export let template: string;
  export let title: string;
  export let username: string;
  export let url: string;
</script>

<style>
  .search-item {
    display: grid;
    grid-template-columns: 1fr max-content auto;
    align-items: center;
    column-gap: var(--spacing);
    width: 100%;
  }

  .text {
    display: grid;
  }

  span {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .icon :global(svg) {
    width: var(--button-icon-size);
    height: var(--button-icon-size);
  }
</style>

<section class:selected class="search-item">
  <article class="text">
    <span class="title" title={`${title}`}>{title}</span>
    <span class="subtitle" title={url}>{url}</span>
    <span class="subtitle" title={username}>{username}</span>
  </article>
  <div class="icon" title={template}>
    {@html templateIcons[icon]}
  </div>
</section>
