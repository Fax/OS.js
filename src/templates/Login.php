<div id="LoginWindow">
  <div id="Login">
    <form method="post" action="javascript:void(0);" id="LoginForm">
      <div class="Row">
        <input type="text" id="LoginUsername" value="" name="username" placeholder="Username" />
      </div>

      <div class="Row">
        <input type="password" id="LoginPassword" value="" name="password" placeholder="Password" />
      </div>

      <div class="Row">
        <div id="LoginButtons">
          <?php if ( ENABLE_REGISTRATION ) { ?>
          <button id="CreateLoginButton">Create User</button>
          <?php } ?>
          <button id="LoginButton">Login</button>
        </div>
      </div>
    </form>
  </div>

  <div id="LoadingBarContainer">
    <div id="LoadingBar"></div>
  </div>

</div>
