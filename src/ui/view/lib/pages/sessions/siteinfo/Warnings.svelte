<script lang="ts" module>
  export interface Props {
    warnings: string[];
  }
</script>

<script lang="ts">
  import { warningIcon } from "@/global/icons";
  import { getMessage, LocalizedMessage } from "@/global/i18n";

  import Icon from "@/ui/view/lib/layout/Icon.svelte";
  import Card from "@/ui/view/lib/layout/Card.svelte";

  let { warnings }: Props = $props();

  const iconProps = {
    d: warningIcon,
    color: "var(--color-warning)",
    size: "1em",
  };
</script>

<section class="grid">
  <h2>
    <span class="icon"><Icon {...iconProps} /></span>
    <span>{getMessage(LocalizedMessage.SESSIONS_WARNINGS)}</span>
  </h2>
  <Card
    backgroundColor="var(--color-warning-light)"
    color="var(--color-warning-dark)"
  >
    <ul class="grid">
      {#each warnings as warning}
        <li>{warning}</li>
      {/each}
    </ul>
  </Card>
</section>

<style>
  h2 {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: var(--spacing);
    align-items: center;
  }

  h2 span {
    color: var(--color-warning);
  }

  li + li {
    border-top: 1px solid var(--color-warning-dark);
  }

  .icon {
    display: flex;
    align-items: center;
  }
</style>
