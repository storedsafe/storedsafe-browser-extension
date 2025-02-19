<script lang="ts">
  import { sites, sessions } from "../../stores";
  import Main from "./Main.svelte";
</script>

<section>
  <Main />
</section>

<style>
  section {
    width: 360px;
    background: radial-gradient(
        circle at 0,
        rgba(255, 255, 255, 0.15),
        rgba(0, 0, 0, 0.15)
      ),
      var(--color-primary-dark);
    box-sizing: border-box;
  }
</style>
