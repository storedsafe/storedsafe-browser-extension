<form data-testid="form">
  <fieldset>
    <label>
      Username <input type="text" name="username" data-testid="username" />
    </label>
    <label for="password">
      Password <span class="secret"><input
          id="password"
          type="password"
          name="password"
          data-testid="password"
        /> </span>
    </label>
  </fieldset>
  <button data-testid="submit">Log in</button>
</form>
