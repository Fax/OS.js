<?php
/*!
 * @file
 * Contains SystemUser Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-05-24
 */

/**
 * SystemUser Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
 * @class
 */
class SystemUser
  extends Application
{
  const APPLICATION_TITLE  = "User Information";
  const APPLICATION_ICON   = "apps/user-info.png";
  const APPLICATION_SYSTEM = true;

  public function __construct() {
    parent::__construct();
  }
}

$window = Array(
  "title"           => SystemUser::APPLICATION_TITLE,
  "icon"            => SystemUser::APPLICATION_ICON,
  "is_draggable"    => true,
  "is_resizable"    => true,
  "is_scrollable"   => false,
  "is_sessionable"  => true,
  "is_minimizable"  => false,
  "is_maximizable"  => false,
  "is_closable"     => true,
  "is_orphan"       => true,
  "width"           => 400,
  "height"          => 250,
  "gravity"         => "center"
);

$html = <<<EOHTML

<div class="SystemUser">
  <div class="SystemUserLoading">
  </div>
  <div class="SystemUserInner">
    <ul>
      <li><a href="#tabs-1">Profile</a></li>
      <li><a href="#tabs-2">Session</a></li>
    </ul>
    <div id="tabs-1">
    </div>
    <div id="tabs-2">
      <div class="SessionData">
        <ul class="SessionDataList">
        </ul>
      </div>
    </div>
  </div>
</div>

EOHTML;


Application::RegisterStatic("SystemUser", $window, $html);

?>
