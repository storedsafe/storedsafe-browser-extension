<!-- See: storytel.com/se/sv/login -->
<section class="container" data-testid="test-004">
  <div class="clear1em" />
  <div class="loginError" id="appleLoginError" />
  <div
    id="appleIdLoginButton"
    class="c-button c-button__apple u-cursor--pointer dont-break-out"
  >
    <!-- svelte-ignore a11y-positive-tabindex -->
    <button class="buttonHidden" tabindex="20" />
    <i class="icon c-icon__button icon-apple" /> Logga in med Apple
  </div>
  <div class="clear1em" />
  <div id="fbLoginButton" class="fbBtn dont-break-out">
    <!-- svelte-ignore a11y-positive-tabindex -->
    <button class="buttonHidden" tabindex="20" />
    <i class="icon icon-facebook" /> Logga in med Facebook
  </div>
  <div class="clear1em" />
  <span class="line-thru login-or-text">eller med</span>
  <h4 class="IEshow">Mejladress/Mobilnummer</h4>
  <div class="signupField">
    <!-- svelte-ignore a11y-positive-tabindex -->
    <input
      class="inputField"
      type="email"
      placeholder="Mejladress/Mobilnummer"
      tabindex="21"
      id="userInput"
      data-testid="test-001"
    />
  </div>
  <div class="clear1em" />
  <h4 class="IEshow">Lösenord</h4>
  <div class="signupField">
    <!-- svelte-ignore a11y-positive-tabindex -->
    <input
      class="inputField"
      type="password"
      placeholder="Lösenord"
      tabindex="22"
      id="passwordInput"
      data-testid="test-002"
    />
  </div>
  <div class="clear1em" />
  <div class="loginError" id="loginError" />
  <div class="buyBtn button-fullWidth dont-break-out" id="loginBtn">
    <!-- svelte-ignore a11y-positive-tabindex -->
    <button class="buttonHidden" tabindex="23" data-testid="test-003" /> Logga in
  </div>
  <div class="clear1em" />
  <p class="center login-info-text">
    <!-- svelte-ignore a11y-positive-tabindex -->
    <a href="/se/sv/byt-losenord" tabindex="24">
      Har du glömt ditt lösenord? Klicka här.
    </a>
    <br />
    <br /> Vill du prova Storytel gratis?
    <!-- svelte-ignore a11y-positive-tabindex -->
     <a
      href="/se/sv/signup/7717"
      tabindex="25"
    >Kom igång direkt</a>
  </p>
</section>
