<script lang="ts">
  import { getMessage, LocalizedMessage } from "../../../../../global/i18n";
  import Card from "../../layout/Card.svelte";
  import ManageSites from "../options/ManageSites.svelte";
</script>

<section class="grid">
  <Card>
    <h2>{getMessage(LocalizedMessage.WELCOME_MESSAGE_TITLE)}</h2>
    <p>
      {@html getMessage(LocalizedMessage.WELCOME_MESSAGE_DESCRIPTION)}
    </p>
    <p>
      {@html getMessage(LocalizedMessage.WELCOME_MESSAGE_PLUG)}
    </p>
  </Card>
  <ManageSites />
</section>

<style>
  h2 {
    text-align: center;
  }
</style>
