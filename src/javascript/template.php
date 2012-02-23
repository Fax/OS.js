<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - template.php
 *
 * Copyright (c) 2011, Anders Evenrud
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met: 
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer. 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution. 
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @package OSjs.Frontend
 * template.php: Main HTML Template
 *
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @created 2012-02-10
 */

$current_locale = DEFAULT_LANGUAGE;
if ( $locale = Core::get()->getLocale() ) {
  $current_locale = $locale['locale_language'];
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
  <!--
  OS.js - JavaScript Operating System - Main HTML Template

  Copyright (c) 2011, Anders Evenrud
  All rights reserved.

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met: 

  1. Redistributions of source code must retain the above copyright notice, this
     list of conditions and the following disclaimer. 
  2. Redistributions in binary form must reproduce the above copyright notice,
     this list of conditions and the following disclaimer in the documentation
     and/or other materials provided with the distribution. 

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
  ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

  @package OSjs.Template
  @author  Anders Evenrud <andersevenrud@gmail.com>
  @licence Simplified BSD License
  -->
  <title>OS.js <?php print PROJECT_VERSION; ?> (<?php print PROJECT_CODENAME; ?>)</title>

  <!-- Compability -->
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <!--<meta http-equiv="X-UA-Compatible" content="IE=9" />
  <meta http-equiv="Content-Style-Type" content="text/css; charset=utf-8" />-->

  <!-- SEO -->
  <meta name="keywords" content="OS.js, JavaScript Operating System, Web Desktop" />
  <meta name="description" content="OS.js - JavaScript Web Desktop" />
  <meta name="author" content="<?php print PROJECT_AUTHOR; ?> <?php print PROJECT_CONTACT; ?>" />
  <meta name="copyright" content="Copyright (c) 2011-2012 Anders Evenrud" />


  <!-- Vendor libraries -->
  <link rel="stylesheet" type="text/css" href="/css/vendor/ui-lightness/jquery-ui-1.8.13.custom.css" />
  <script type="text/javascript" src="/js/vendor/json2.js"></script>
  <script type="text/javascript" src="/js/vendor/sprintf-0.7-beta1.js"></script>
  <script type="text/javascript" src="/js/vendor/jquery-1.7.1.min.js"></script>
  <script type="text/javascript" src="/js/vendor/jquery-ui-1.8.17.custom.min.js"></script>

  <!-- Utiltiy libraries -->
  <script type="text/javascript" src="/js/utils.js"></script>

  <!-- OS.js stylesheets -->
  <link rel="stylesheet" type="text/css" href="/ajax/resource/main.css" />
  <link rel="stylesheet" type="text/css" href="/ajax/resource/glade.css" />
  <link rel="stylesheet" type="text/css" href="/ajax/resource/pimp.css" />
<!--[if lt IE 9]>
<link rel="stylesheet" type="text/css" href="/?resource=ie.css" />
<![endif]-->

  <!-- OS.js defineable -->
  <link rel="stylesheet" type="text/css" href="/ajax/font/Sansation" id="FontFace" />
  <link rel="stylesheet" type="text/css" href="/ajax/theme/default" id="ThemeBase" />
  <link rel="stylesheet" type="text/css" href="/ajax/theme/dark" id="ThemeFace" />
  <link rel="stylesheet" type="text/css" href="/ajax/cursor/default" id="CursorFace" />

  <!-- OS.js libraries -->
  <script type="text/javascript" src="/ajax/resource/init.js"></script>
  <script type="text/javascript" src="/ajax/language/<?php print $current_locale; ?>" id="LanguageFile"></script>
  <script type="text/javascript" src="/ajax/resource/classes.js"></script>
  <script type="text/javascript" src="/ajax/resource/core.js"></script>
  <script type="text/javascript" src="/ajax/resource/main.js"></script>

  <!-- Google Analytics -->
<?php if ( ENV_PRODUCTION ) { ?>
  <script type="text/javascript">
    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', 'UA-26635797-1']);
    _gaq.push(['_trackPageview']);

    (function() {
      var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
      ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();
  </script>
<?php } else { ?>
  <!-- Disabled on development environment -->
<?php } ?>
</head>
<body>

<!-- Main Container -->
<div id="Desktop">
  <!-- IconView -->
  <div id="DesktopGrid"></div>

  <!-- Notifications -->
  <div id="DesktopNotifications"></div>

  <!-- Context items -->
  <div id="ContextMenu">&nbsp;</div>
  <div id="ContextRectangle">&nbsp;</div>
  <div id="Tooltip">&nbsp;</div>

  <!-- Loaded content will appear here -->
</div>

<!-- Loading -->
<div id="Loading">
  <div id="LoadingVersion"><?php print PROJECT_VERSION; ?></div>
  <div id="LoadingBarContainer">
    <div id="LoadingBar"></div>
  </div>
</div>

<!-- Templates -->
<div id="LoginWindow" class="Window" style="display:none">
  <div id="LoginWindowStatus">Automatic login in <span>x</span> second(s)</div>

  <form method="post" action="javascript:void;" id="LoginForm">
    <div class="Row">
      <label for="LoginUsername">Username</label>
      <input type="text" id="LoginUsername" value="" name="username" />
    </div>
    <div class="Row">
      <label for="LoginPassword">Password</label>
      <input type="password" id="LoginPassword" value="" name="password" />
    </div>
    <div class="Buttons">
      <input type="submit" value="Log in" id="LoginButton" />
    </div>
  </form>
</div>

<div id="Window" style="display:none">
  <div class="Window">
    <div class="WindowTop">
      <div class="WindowTopInner">
        <img alt="" src="/img/icons/16x16/emblems/emblem-unreadable.png" />
        <span></span>
      </div>
      <div class="WindowTopControllers">
        <div class="WindowTopController">
          <div class="ActionMinimize">&nbsp;</div>
        </div>
        <div class="WindowTopController">
          <div class="ActionMaximize">&nbsp;</div>
        </div>
        <div class="WindowTopController">
          <div class="ActionClose">&nbsp;</div>
        </div>
      </div>
    </div>
    <div class="WindowContent">
      <div class="WindowContentInner">
      </div>
    </div>
  </div>
</div>

<div id="Dialog" style="display:none">
  <div class="Window Dialog">
    <div class="WindowTop">
      <div class="WindowTopInner">
        <img alt="" src="/img/blank.gif" />
        <span></span>
      </div>
      <div class="WindowTopControllers">
        <div class="WindowTopController ActionClose">
          <span>x</span>
        </div>
      </div>
    </div>
    <div class="WindowContent">
      <div class="WindowContentInner">
        <div class="DialogContent">
          This is a dialog!
        </div>
        <div class="DialogButtons">
          <button class="Choose" style="display:none;">Choose</button>
          <button class="Ok" style="display:none;">Ok</button>
          <button class="Close">Close</button>
          <button class="Cancel" style="display:none;">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</div>

<div id="OperationDialogColor" style="display:none">
  <div class="OperationDialog OperationDialogColor">
    <div class="OperationDialogInner">
      <div>
        <div class="Slider SliderR"></div>
      </div>
      <div>
        <div class="Slider SliderG"></div>
      </div>
      <div>
        <div class="Slider SliderB"></div>
      </div>
    </div>
    <div class="CurrentColor">
    </div>
    <div class="CurrentColorDesc">
    </div>
  </div>
</div>

<div id="OperationDialogFont" style="display:none">
  <div class="OperationDialog OperationDialogFont">
    <div class="OperationDialogInner">
      <select class="OperationDialogFontList" multiple="false" height="10"></select>
      <select class="OperationDialogFontSize" multiple="false" height="10"></select>
      <div class="OperationDialogFontPreview">
      </div>
    </div>
  </div>
</div>

<div id="OperationDialogCopy" style="display:none">
  <div class="OperationDialog OperationDialogCopy">
    <h1>Copy file</h1>
    <div class="OperationDialogInner">
      <p class="Status">0 of 0</p>
      <div class="ProgressBar"></div>
    </div>
  </div>
</div>

<div id="OperationDialogRename" style="display:none">
  <div class="OperationDialog OperationDialogRename">
    <h1>Rename file</h1>
    <div class="OperationDialogInner">
      <input type="text" />
    </div>
  </div>
</div>

<div id="OperationDialogUpload" style="display:none">
  <div class="OperationDialog OperationDialogUpload">
    <h1>Upload file...</h1>
    <div class="OperationDialogInner">
      <p class="Status">No file selected</p>
      <div class="ProgressBar"></div>
    </div>
  </div>
</div>

<div id="OperationDialogFile" style="display:none">
  <div class="OperationDialog OperationDialogFile">
    <div class="FileChooser">
      <ul>
      </ul>
    </div>
    <div class="FileChooserInput">
      <input type="text" />
    </div>
  </div>
</div>

<div id="OperationDialogFileProperties" style="display:none">
  <div class="OperationDialog OperationDialogFileProperties">
    <table>
      <tr>
        <td class="pri">Filename<td>
        <td class="sec TDName">&nbsp;</td>
      </tr>
      <tr>
        <td class="pri">Path<td>
        <td class="sec TDPath">&nbsp;</td>
      </tr>
      <tr>
        <td class="pri">Size<td>
        <td class="sec TDSize">&nbsp;</td>
      </tr>
      <tr>
        <td class="pri">MIME<td>
        <td class="sec TDMIME">&nbsp;</td>
      </tr>
      <tr>
        <td class="pri">Information<td>
        <td class="sec TDInfo">
          <div class="InfoBox">
            <pre></pre>
          </div>
        </td>
      </tr>
    </table>
  </div>
</div>

<div id="OperationDialogLaunch" style="display:none">
  <div class="OperationDialog OperationDialogLaunch">
    <div class="OperationDialogInner">
      <ul>
      </ul>
      <div>
        <input type="checkbox" /> <label class="UseDefault">Use this as default application</label>
      </div>
    </div>
  </div>
</div>

<div id="OperationDialogPanelItem" style="display:none">
  <div class="OperationDialog OperationDialogPanelItem">
    <div class="OperationDialogInner">
    </div>
  </div>
</div>

<div id="OperationDialogPanelItemAdd" style="display:none">
  <div class="OperationDialog OperationDialogPanelItemAdd">
    <div class="OperationDialogInner Wrapper">
      <ul>
      </ul>
    </div>
  </div>
</div>

<div id="OperationDialogInput" style="display:none">
  <div class="OperationDialog OperationDialogInput">
    <h1>Input:</h1>
    <div class="OperationDialogInner">
      <input type="text" />
    </div>
  </div>
</div>

<!-- Version Stamp -->
<div id="Version">
  OS.js <?php print PROJECT_VERSION; ?> (<?php print PROJECT_CODENAME; ?>) | Build <?php echo PROJECT_BUILD; ?><br />
  &copy; <?php print PROJECT_AUTHOR; ?> &lt;<?php print PROJECT_CONTACT; ?>&gt;
</div>

<!-- Google -->

<!--
<g:plusone size="small" annotation="inline"></g:plusone>
<script type="text/javascript">
  (function() {
    var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
    po.src = 'https://apis.google.com/js/plusone.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
  })();
</script>
-->

</body>
</html>
