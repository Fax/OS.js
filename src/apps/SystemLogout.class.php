<?php
/*!
 * @file
 * Contains SystemLogout Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-05-24
 */

/**
 * SystemLogout Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
 * @class
 */
class SystemLogout
  extends DesktopApplication
{
  const APP_TITLE = "Logout";
  const APP_ICON = "actions/gnome-logout.png";
  const APP_HIDDEN = true;

  public function __construct() {

    $this->content = <<<EOHTML

<div class="SystemLogout">
  <div class="SystemLogoutInner">
    <h1>Are you sure?</h1>
    <input type="checkbox" checked="checked" /><label>Save my session</label>
  </div>
  <div class="SystemLogoutButtons">
    <button class="Logout">Logout</button>
    <button class="Cancel">Cancel</button>
  </div>
</div>

EOHTML;

    /*
    $this->resources = Array(
      "sys.logout.js",
      "sys.logout.css"
    );
     */
    $this->width = 200;
    $this->height = 120;
    $this->gravity = "center";
    $this->is_draggable = false;
    $this->is_resizable = false;
    $this->is_scrollable = false;
    $this->is_minimizable = false;
    $this->is_maximizable = false;

    parent::__construct(self::APP_TITLE, self::APP_ICON, self::APP_HIDDEN);
  }

  public static function Event($uuid, $action, Array $args) {
  }
}

DesktopApplication::$Registered[] = "SystemLogout";

?>
