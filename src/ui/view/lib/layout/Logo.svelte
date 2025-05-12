<script lang="ts">
  import { getMessage, LocalizedMessage } from "@/global/i18n";
</script>

<img src="/assets/logo.svg" alt={getMessage(LocalizedMessage.IMG_LOGO_ALT)} />

<style>
  img {
    max-width: 90%;
    max-height: 2.2em;
    margin: auto;
    user-select: none;
  }
</style>
