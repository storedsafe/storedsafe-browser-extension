<script lang="ts">
  import Card from "../layout/Card.svelte";

  // const opie = {
  //   edit: false,
  //   delimeter: "space",
  // };

  // const secure = {
  //   edit: false,
  //   length: 20,
  // };
</script>

<style>
  p {
    font-weight: bold;
    text-align: center;
    color: var(--color-primary-dark);
  }

  .buttons {
    display: flex;
    flex-direction: row;
    justify-content: stretch;
    width: 100%;
  }

  button {
    border-radius: 0;
    flex-grow: 1;
  }

  .buttons button:last-child {
    border-bottom-right-radius: var(--border-radius);
  }

  .buttons button:first-child {
    border-bottom-left-radius: var(--border-radius);
  }

  .match {
    width: 100%;
    border-top-right-radius: var(--border-radius);
    border-top-left-radius: var(--border-radius);
  }
</style>

<Card>
  <p>Password: </p>
  <button type="button" class="match">Match Policy</button>
  <div class="buttons">
    <button type="button" class="primary">Opie</button>
    <button type="button" class="primary">Secure</button>
    <button type="button" class="primary">Dice</button>
    <button type="button" class="primary">Pronounceable</button>
    <button type="button" class="primary">Pin</button>
  </div>
</Card>
