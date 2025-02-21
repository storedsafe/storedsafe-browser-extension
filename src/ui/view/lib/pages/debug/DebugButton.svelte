<script lang="ts">
  interface Props {
    toggleDebug?: () => void;
  }

  let { toggleDebug }: Props = $props();
</script>

<div
  id="debug-button"
  ondblclick={() => toggleDebug?.()}
  role="button"
  tabindex="-1"
></div>

<style>
  #debug-button {
    position: absolute;
    width: var(--spacing);
    height: var(--spacing);
    left: 0;
    top: 0;
  }
</style>
