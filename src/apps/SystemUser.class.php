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
  </div>
</div>

EOHTML;

    $this->resources = Array(
      "sys.user.js",
      "sys.user.css"
    );
    $this->is_scrollable = false;
    $this->is_resizable = false;
    $this->is_maximizable = false;
    $this->width = 200;
    $this->height = 200;

    parent::__construct(self::APP_TITLE, self::APP_ICON, self::APP_HIDDEN);
  }
}

DesktopApplication::$Registered[] = "SystemUser";

?>
