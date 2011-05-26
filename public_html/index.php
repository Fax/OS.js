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

header("Content-Type: text/html");
?>
<!DOCTYPE html>
<html lang="en" manifest="cache.manifest">
<head>
  <title>Another JSWM</title>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

  <link rel="stylesheet" type="text/css" href="/css/ui-lightness/jquery-ui-1.8.11.custom.css" />
  <link rel="stylesheet" type="text/css" href="/css/main.css" />
  <link rel="stylesheet" type="text/css" href="/css/theme.default.css" />

  <script type="text/javascript" src="/js/json2.js"></script>
  <script type="text/javascript" src="/js/sprintf-0.7-beta1.js"></script>
  <script type="text/javascript" src="/js/fileuploader.js"></script>
  <script type="text/javascript" src="/js/jquery-1.5.2.min.js"></script>
  <script type="text/javascript" src="/js/jquery-ui-1.8.11.custom.min.js"></script>
  <script type="text/javascript" src="/js/utils.js"></script>
  <script type="text/javascript" src="/js/main.js"></script>

  <!-- Preloaded applications -->
  <link rel="stylesheet" type="text/css" href="/css/sys.user.css" />
  <link rel="stylesheet" type="text/css" href="/css/sys.settings.css" />
  <link rel="stylesheet" type="text/css" href="/css/sys.logout.css" />

  <script type="text/javascript" src="/js/sys.user.js"></script>
  <script type="text/javascript" src="/js/sys.settings.js"></script>
  <script type="text/javascript" src="/js/sys.logout.js"></script>
</head>
<body>

<div id="Desktop">
  <!-- Panel -->
  <div class="DesktopPanel AlignTop" id="Panel">

    <div class="PanelItem PanelItemMenu">
      <img alt="" src="/img/icons/16x16/categories/gnome-applications.png" title="Launch Application" />
    </div>

    <div class="PanelItem PanelItemSeparator">&nbsp;</div>

    <div class="PanelItemHolder PanelWindowHolder">
    </div>

    <div class="PanelItem PanelItemClock AlignRight">
      <span>31/01/00 00:00</span>
    </div>

    <div class="PanelItem PanelItemSeparator AlignRight">&nbsp;</div>

    <div class="PanelItemHolder PanelItemDock AlignRight">
      <div class="PanelItem PanelItemLauncher">
        <span class="launch_SystemSettings"><img alt="" src="/img/icons/16x16/categories/applications-system.png" title="System Settings" /></span>
      </div>
      <div class="PanelItem PanelItemLauncher">
        <span class="launch_SystemUser"><img alt="" src="/img/icons/16x16/apps/user-info.png" title="User Information" /></span>
      </div>
      <div class="PanelItem PanelItemLauncher">
        <span class="launch_SystemLogout"><img alt="" src="/img/icons/16x16/actions/gnome-logout.png" title="Save and Quit" /></span>
      </div>
    </div>
  </div>

  <div id="ContextMenu">
  </div>

  <!-- Content -->
</div>

<!-- Console -->
<div id="Console">
</div>

<!-- Loading -->
<div id="Loading" style="display:none">
  <div id="LoadingBar"></div>
</div>

<!-- Templates -->
<div id="Window" style="display:none">
  <div class="Window">
    <div class="WindowTop">
      <div class="WindowTopInner">
        <img alt="" src="/img/icons/16x16/emblems/emblem-unreadable.png" />
        <span></span>
      </div>
      <div class="WindowTopControllers">
        <div class="WindowTopController ActionMinimize">
          <span>_</span>
        </div>
        <div class="WindowTopController ActionMaximize">
          <span>+</span>
        </div>
        <div class="WindowTopController ActionClose">
          <span>x</span>
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
          <button class="Close">Close</button>
          <button class="Ok" style="display:none;">Ok</button>
          <button class="Cancel" style="display:none;">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</div>

</body>
</html>
