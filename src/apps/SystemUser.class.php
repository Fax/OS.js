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
  extends DesktopApplication
{
  const APP_TITLE = "User Information";
  const APP_ICON = "apps/user-info.png";
  const APP_HIDDEN = true;

  public function __construct() {
    $this->content = <<<EOHTML

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

    /*
    $this->resources = Array(
      "sys.user.js",
      "sys.user.css"
    );
     */

    $this->is_scrollable = false;
    $this->is_resizable = true;
    $this->is_maximizable = false;
    $this->is_orphan = true;
    $this->width = 400;
    $this->height = 250;

    parent::__construct(self::APP_TITLE, self::APP_ICON, self::APP_HIDDEN);
  }
}

DesktopApplication::$Registered[] = "SystemUser";

?>
