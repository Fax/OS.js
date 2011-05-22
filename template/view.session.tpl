{if $Page == "login"}
  <h1>Login</h1>
  <p>
    <a href="/forgot_username/">I have forgotten my username</a>
    |
    <a href="/forgot_password/">I have forgotten my password</a>
  </p>
{elseif $Page == "forgot"}
  <h1>Forgot login information</h1>
  <p>
    Please enter your cellphone-number below to reset your account crendentials.
  </p>
{elseif $Page == "register"}
  <h1>Register</h1>
{/if}

{include file="{$PATH_TEMPLATE}/std.form.tpl"}
