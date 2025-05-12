<script lang="ts">
  import IFrame from "@/ui/view/iframe/IFrame.svelte";

  const url = new URL(document.location.href);
  const page = url.hash.slice(1);
</script>

<IFrame {page} />
