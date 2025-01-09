<script lang="ts">
  interface PopupProps {
    name?: string;
  }

  let { name = "Popup" }: PopupProps = $props();
</script>

<h1>Hello, {name}!</h1>
