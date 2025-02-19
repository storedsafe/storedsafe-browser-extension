<script lang="ts" module>
  export interface Props {
    selected?: boolean;
    title: string;
    subtitle: string;
    icon: string;
  }
</script>

<script lang="ts">
  import Icon from "../../layout/Icon.svelte";

  let { selected = false, title, subtitle, icon }: Props = $props();
</script>

<div class:selected class="item">
  <div class="icon"><Icon d={icon} color="var(--color-primary)" /></div>
  <span class="title">{title}</span>
  <span class="subtitle dot-overflow" title={subtitle}>{subtitle}</span>
</div>

<style>
  .item {
    display: grid;
    grid-auto-flow: column;
    grid-template-areas:
      "icon title"
      "icon subtitle";
    column-gap: var(--spacing);
    align-items: center;
  }

  .item.selected {
    justify-content: center;
    grid-template-areas:
      "icon title"
      "subtitle subtitle";
  }

  .item.selected .title {
    text-align: start;
  }

  .item.selected .icon {
    justify-self: end;
  }

  .icon {
    display: grid;
    grid-area: icon;
  }

  .title {
    grid-area: title;
  }

  .subtitle {
    grid-area: subtitle;
  }
</style>
