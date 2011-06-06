<?php
/*!
 * @file
 * index.php
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-05-26
 */

require "../header.php";

if ( !($wm = WindowManager::initialize()) ) {
  die("Failed to initialize window manager");
}

if ( !($json = $wm->doGET($_GET)) === false ) {
  header("Content-Type: application/json");
  die($json);
}
if ( !($json = $wm->doPOST($_POST)) === false ) {
  header("Content-Type: application/json");
  die($json);
}


$append = "";
if ( !ENABLE_CACHE ) {
  header("Expires: Fri, 01 Jan 2010 05:00:00 GMT");
  header("Cache-Control: maxage=1");
  header("Cache-Control: no-cache");
  header("Pragma: no-cache");

  $append = "?" . time();
}

header("Content-Type: text/html; charset=utf-8");
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <!--
  JavaScript Window Manager

  @package ajwm.Template
  @author  Anders Evenrud <andersevenrud@gmail.com>
  -->
  <title>Another JSWM</title>

  <!-- Compability -->
<!--
  <meta http-equiv="X-UA-Compatible" content="IE=9" />
  <meta http-equiv="Content-Style-Type" content="text/css; charset=utf-8" />
-->
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

  <!-- Vendor libraries -->
  <link rel="stylesheet" type="text/css" href="/css/ui-lightness/jquery-ui-1.8.13.custom.css" />

  <script type="text/javascript" src="/js/vendor/json2.js"></script>
  <script type="text/javascript" src="/js/vendor/sprintf-0.7-beta1.js"></script>
  <script type="text/javascript" src="/js/vendor/fileuploader.js"></script>
  <script type="text/javascript" src="/js/vendor/jquery-1.5.2.min.js"></script>
  <script type="text/javascript" src="/js/vendor/jquery-ui-1.8.13.custom.min.js"></script>
  <script type="text/javascript" src="/js/vendor/jquery.touch.compact.js"></script>

  <!-- Main libraries -->
  <link rel="stylesheet" type="text/css" href="/css/main.css<?php print $append; ?>" />
  <link rel="stylesheet" type="text/css" href="/css/pimp.css<?php print $append; ?>" />
  <link rel="stylesheet" type="text/css" href="/css/theme.default.css<?php print $append; ?>" />

  <script type="text/javascript" src="/js/utils.js<?php print $append; ?>"></script>
  <script type="text/javascript" src="/js/main.js<?php print $append; ?>"></script>

  <!-- Preloaded resources -->
  <link rel="stylesheet" type="text/css" href="/css/sys.about.css<?php print $append; ?>" />
  <link rel="stylesheet" type="text/css" href="/css/sys.user.css<?php print $append; ?>" />
  <link rel="stylesheet" type="text/css" href="/css/sys.settings.css<?php print $append; ?>" />
  <link rel="stylesheet" type="text/css" href="/css/sys.logout.css<?php print $append; ?>" />
  <link rel="stylesheet" type="text/css" href="/css/sys.terminal.css<?php print $append; ?>" />

  <script type="text/javascript" src="/js/panel.separator.js<?php print $append; ?>"></script>
  <script type="text/javascript" src="/js/panel.clock.js<?php print $append; ?>"></script>
  <script type="text/javascript" src="/js/panel.menu.js<?php print $append; ?>"></script>
  <script type="text/javascript" src="/js/panel.windowlist.js<?php print $append; ?>"></script>
  <script type="text/javascript" src="/js/panel.dock.js<?php print $append; ?>"></script>
  <script type="text/javascript" src="/js/panel.weather.js<?php print $append; ?>"></script>

  <script type="text/javascript" src="/js/sys.about.js<?php print $append; ?>"></script>
  <script type="text/javascript" src="/js/sys.user.js<?php print $append; ?>"></script>
  <script type="text/javascript" src="/js/sys.settings.js<?php print $append; ?>"></script>
  <script type="text/javascript" src="/js/sys.logout.js<?php print $append; ?>"></script>
  <script type="text/javascript" src="/js/sys.terminal.js<?php print $append; ?>"></script>
</head>
<body>

<div id="Desktop">
  <!-- Panel -->
  <div class="DesktopPanel AlignTop" id="Panel"><ul></ul></div>

  <div id="ContextMenu">&nbsp;</div>

  <div id="ContextRectangle">&nbsp;</div>

  <!-- Content -->
</div>

<!-- Loading -->
<div id="Loading">
  <div id="LoadingBar"></div>
</div>

<!-- Templates -->
<div id="LoginWindow" class="Window" style="display:none">
  <div class="WindowContent">
    <div class="WindowContentInner">
      <form method="post" action="/">
        <div class="Row">
          <label for="LoginUsername">Username</label>
          <input type="text" id="LoginUsername" value="Administrator" name="username" />
        </div>
        <div class="Row">
          <label for="LoginPassword">Password</label>
          <input type="password" id="LoginPassword" value="Administrator" name="password" />
        </div>
        <div class="Buttons">
          <input type="submit" value="Log in" />
        </div>
      </form>
    </div>
  </div>
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
    <div class="WindowMenu">
      <ul class="Top">
        <!--
        <li class="Top">
          <span class="Top">File</span>
          <ul class="Menu">
            <li><span>Close</span></li>
          </ul>
        </li>
        -->
      </ul>
    </div>
    <div class="WindowContent">
      <div class="WindowContentInner">
      </div>
    </div>
    <div class="WindowBottom">
      <div class="WindowBottomInner">
      </div>
    </div>
  </div>
</div>

<div id="Dialog" style="display:none">
  <div class="Window Dialog">
    <div class="WindowTop">
      <div class="WindowTopInner">
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

<div id="OperationDialogLaunch" style="display:none">
  <div class="OperationDialog OperationDialogLaunch">
    <div class="OperationDialogInner">
      <ul>
      </ul>
      <div>
        <input type="checkbox" disabled="disabled" /> <label>Use this as default application</label>
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

<!-- Version Stamp -->
<div id="Version">
  JSWM Version <?php print PROJECT_VERSION; ?>
  -
  <?php print PROJECT_AUTHOR; ?>

  &lt;<?php print PROJECT_CONTACT; ?>&gt;

  |

  <a href="/help.html" target="_blank">help</a>
</div>

</body>
</html>
