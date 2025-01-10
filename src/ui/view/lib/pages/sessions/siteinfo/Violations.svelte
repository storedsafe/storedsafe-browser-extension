<script lang="ts">
  import { errorIcon } from "../../../../../../global/icons";
  import { getMessage, LocalizedMessage } from "../../../../../../global/i18n";

  import Icon from "../../../layout/Icon.svelte";
  import Card from "../../../layout/Card.svelte";

  export let violations: string[];

  const iconProps = {
    d: errorIcon,
    color: "var(--color-danger)",
    size: "1em",
  };
</script>

<style>
  h2 {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: var(--spacing);
    align-items: center;
  }

  h2 span {
    color: var(--color-danger);
  }

  li + li {
    border-top: 1px solid var(--color-danger-dark);
  }

  .icon {
    display: flex;
    align-items: center;
  }
</style>

<section class="grid">
  <h2>
    <span class="icon"><Icon {...iconProps} /></span>
    <span>{getMessage(LocalizedMessage.SESSIONS_VIOLATIONS)}</span>
  </h2>
  <Card
    backgroundColor="var(--color-danger-light)"
    color="var(--color-danger-dark)">
    <ul class="grid">
      {#each violations as violation}
        <li>{violation}</li>
      {/each}
    </ul>
  </Card>
</section>
